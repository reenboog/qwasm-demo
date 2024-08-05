import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import useDragAndDrop from './useDragAndDrop';
import init, { Protocol, JsNet } from 'qwasm';
import AuthPage from './AuthPage';
import FileTable from './FileTable';
import mime from 'mime';
import './App.css';

const chunkSize = 1024 * 1024;
let nodeIdx = 1;
// let email = 'god@world.org';
// let pass = 'god pass';
let cached_files = {};
const host = 'http://localhost:5050';

const App = () => {
	const [currentDir, setCurrentDir] = useState(null);
	const [protocol, setProtocol] = useState(null);
	const [progress, setProgress] = useState({});
	const [authenticated, setAuthenticated] = useState(false);
	const [net, setNet] = useState(false);

	const openDir = async (id) => {
		console.log(`Opening directory: ${id}`);

		try {
			setCurrentDir(await protocol.cd_to_dir(id));
		} catch (e) {
			console.error('error ls-ing a dir:', e);
		}
	};

	const openFile = async (id) => {
		console.log(`Opening file: ${id}`);

		// download
		// decrypt
		// build
		// open
		let ct = cached_files[id];
		let type = mime.getType(currentDir.items().find((file) => file.id() === id).ext());

		console.log('ct.len = ', ct.length);

		// WARNING: this only reads whole-encrypted files for now; so either supply all the meta info (including chunk size), 
		// or stick to one method of encryption (bulk or chunked)
		// TODO: decrypt in chunks instead
		let pt = await protocol.decrypt_block_for_file(ct, id);
		const blob = new Blob([pt], { type: type });

		const fileUrl = URL.createObjectURL(blob);

		window.open(fileUrl);
	};

	const handleItemClick = async (item) => {
		if (item.is_dir()) {
			await openDir(item.id());
		} else {
			await openFile(item.id());
		}
	};

	const handleBackClick = async () => {
		setCurrentDir(await protocol.go_back());
	};

	const handleBreadcrumbClick = async (id) => {
		await openDir(id);
	};

	const handleAddUser = async () => {
		console.log('add user');
	}

	const handleUpload = async (event) => {
		const files = event.target.files;

		if (files.length > 0) {
			let fileIds = [];

			for (const file of files) {
				const ext = mime.getExtension(file.type) ?? 'file';

				console.log(`File selected: ${file.name}`);
				console.log(`Last modified: ${new Date(file.lastModified)}`);
				console.log(`Size: ${file.size} bytes`);
				console.log(`Type: ${file.type}`);
				console.log(`Ext: ${ext}`);

				let id = await protocol.touch(file.name, ext);

				setCurrentDir(await protocol.ls_cur_mut());

				fileIds.push({ id, file });
			}

			await Promise.all(fileIds.map(({ id, file }) => uploadFileInRanges(id, file)));
			// fileIds.map(({ id, file }) => uploadFileInBulk(id, file))
			// fileIds.map(({ id, file }) => uploadFileInStream(id, file))
		}
	};

	const uploadFileInRanges = async (id, file) => {
		const numChunks = Math.ceil(file.size / chunkSize);
		let readOffset = 0;
		let chunkIdx = 0;
		let encryptedOffset = 0;
		// IMPORTANT: aes gcm is used, so auth tag is appended to the end of each chunk! It makes encrypted
		// chunks 16 bytes larger than plain text ones; therefore, when downloading & decrypting,
		// add aes auth tag (16 bytes) to chunk_size first
		const encryptedFileSize = file.size + numChunks * 16;

		while (readOffset < file.size) {
			const chunk = file.slice(readOffset, readOffset + chunkSize);
			const encrypted = await protocol.chunk_encrypt_for_file(new Uint8Array(await chunk.arrayBuffer()), id, chunkIdx);

			await uploadChunk(encrypted, encryptedOffset, encryptedFileSize, id);

			encryptedOffset += encrypted.byteLength;
			chunkIdx += 1;

			setProgress((prev) => ({
				...prev,
				[id]: ((chunkIdx + 1) / numChunks) * 100
			}));

			console.log(`${file.name} Uploaded chunk ${(readOffset / chunkSize) + 1}/${numChunks} of file ${file.name}`);

			readOffset += chunkSize;
		}

		console.log(`File upload completed for ${file.name}`);
	};

	const uploadChunk = async (chunk, offset, fileSize, id) => {
		const url = `${host}/uploads/chunk`;
		const response = await fetch(`${url}/${id}`, {
			method: 'POST',
			headers: {
				'x-uploader-auth': 'aabb1122', // Replace with your auth token
				'Content-Range': `bytes ${offset}-${offset + chunk.byteLength - 1}/${fileSize}`,
				'Content-Type': 'application/octet-stream'
			},
			body: chunk
		});

		if (!response.ok) {
			throw new Error(`Failed to upload chunk: ${response.statusText}`);
		}
	};

	const uploadFileInStream = async (id, file) => {
		// WARNING: may not work locally due to `net::ERR_H2_OR_QUIC_REQUIRED`
		const url = `${host}/uploads/stream`;
		const fileId = id;
		let readOffset = 0;
		const fileSize = file.size;

		const stream = new ReadableStream({
			start(controller) {
				let chunkIdx = 0;

				const push = async () => {
					if (readOffset < file.size) {
						try {
							const chunk = await file.slice(readOffset, readOffset + chunkSize).arrayBuffer();
							const encrypted = await protocol.chunk_encrypt_for_file(new Uint8Array(chunk), id, chunkIdx);

							controller.enqueue(encrypted);
							readOffset += chunkSize;

							setProgress(prev => ({
								...prev,
								[id]: ((readOffset + 1) / fileSize) * 100
							}));

							console.log(`enqueued ${chunkSize}, uploaded ${readOffset}`)

							chunkIdx += 1;

							push();
						} catch (error) {
							console.error(`Error reading or encrypting chunk:`, error);
							controller.error(error);
						}
					} else {
						controller.close();
					}
				};

				push(); // Start reading and processing chunks
			}
		});

		try {
			const response = await fetch(`${url}/${fileId}`, {
				method: 'POST',
				headers: {
					'x-uploader-auth': 'aabb1122',
					// TODO: it could be possible to start streaming from a specific offset, hence conten-range
					// this is sent only for the first chunk, so no need to accumulate encryptedOffset
					'Content-Range': `bytes ${readOffset}-${readOffset + fileSize - 1}/${fileSize}`,
				},
				body: stream,
				duplex: 'half'
			});

			console.log(`response: ${response.statusText}`);
		} catch (error) {
			console.error(`Error uploading file:`, error);
		}
	};

	const uploadFileInBulk = async (id, file) => {
		const offset = 0;
		const data = new Uint8Array(await file.arrayBuffer());
		const ct = await protocol.encrypt_block_for_file(data, id);
		const fileSize = ct.byteLength;

		console.log(`Uploading whole file: Start: ${offset}, End: ${fileSize - 1}, Total size: ${fileSize}`);

		await uploadChunk(ct, offset, fileSize, id);

		setProgress(prev => ({
			...prev,
			[id]: 100
		}));

		console.log(`File upload completed for ${file.name}`);

		cached_files[id] = ct;
	};

	const handleAddDir = async () => {
		await protocol.mkdir('dir_' + nodeIdx);

		nodeIdx += 1;

		setCurrentDir(await protocol.ls_cur_mut());
	};

	const handleDrop = async (e) => {
		// TODO: implement properly
		const droppedItems = e.dataTransfer.items;

		const logNode = async (entry, path = '') => {
			console.log(path + entry.name + (entry.isDirectory ? '/' : ''));

			if (entry.isDirectory) {
				const reader = entry.createReader();
				const readAllEntries = async () => {
					let entries = [];
					let readEntries;
					do {
						readEntries = await new Promise((resolve) => reader.readEntries(resolve));
						entries = entries.concat(readEntries);
					} while (readEntries.length > 0);
					return entries;
				};

				const entries = await readAllEntries();
				for (let i = 0; i < entries.length; i++) {
					await logNode(entries[i], path + entry.name + '/');
				}
			}
		};

		for (let i = 0; i < droppedItems.length; i++) {
			const item = droppedItems[i].webkitGetAsEntry();
			if (item) {
				await logNode(item);
			}
		}
	};

	const dragActive = useDragAndDrop(handleDrop);

	const fetchSubtree = async () => {
		// if (!response.ok) {
		// throw new Error(JSON.stringify({
		//   message: `HTTP error! status: ${response.status}`,
		//   status: response.status,
		//   recentHash: "exampleRecentHash"
		// }));
		// }

		const data = [1, 2, 3];
		const json = JSON.stringify(data);

		return json;
	};

	const uploadNodes = async (json) => {
		const url = `${host}/nodes`;

		const response = await fetch(`${url}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: json
		});

		if (!response.ok) {
			throw new Error(`Failed to upload chunk: ${response.statusText}`);
		}
	};

	const handleAuthSuccess = async (json, password) => {
    const net = new JsNet(fetchSubtree, uploadNodes);
    const protocol = await Protocol.unlock_with_pass(password, new TextEncoder().encode(json), net);

    setProtocol(protocol);
    setCurrentDir(await protocol.ls_cur_mut());
    setAuthenticated(true);
  };

	const handleSignup = async (pass, email) => {
		// should be optional to signup as an admin
		console.log('signup')

		const god = Protocol.register_as_god(pass, net);
		const json = god.json();
		const protocol = god.as_protocol();
		const signup = `{ "email": "${email}", "pass": "${pass}", "user": ${json} }`;

		console.log(signup);

		const response = await fetch(`${host}/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: signup
		});

		if (!response.ok) {
			throw new Error(`Failed to signup: ${response.statusText}`);
		}

		setAuthenticated(true);
		setProtocol(protocol);
		setCurrentDir(await protocol.ls_cur_mut());
	}

	const handleLogin = async (pass, email) => {
		console.log('login')
		 const login = `{ "email": "${email}", "pass": "${pass}" }`;
		const response = await fetch(`${host}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: login
		});

		if (!response.ok) {
			throw new Error(`Failed to signup: ${response.statusText}`);
		}	

		const json = await response.text();

		console.log(json);

		const protocol = await Protocol.unlock_with_pass(pass, json, net);
		setAuthenticated(true);
		setProtocol(protocol);
		setCurrentDir(await protocol.ls_cur_mut());
	}

	useEffect(async () => {
		await init();
		setNet(new JsNet(fetchSubtree, uploadNodes));
	}, []);

	return (
		<Container sx={{ padding: '20px' }}>
    {!authenticated ? (
      <AuthPage onSignupClick={handleSignup} onLoginClick={handleLogin} />
    ) : (
      <>
        {protocol !== null && currentDir !== null ? (
          <FileTable
            currentDir={currentDir}
            onItemClick={handleItemClick}
            onBackClick={handleBackClick}
            onBreadcrumbClick={handleBreadcrumbClick}
						onAddUserClick={handleAddUser}
            onUploadClick={handleUpload}
            onAddDirClick={handleAddDir}
            progress={progress}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            loading...
          </Box>
        )}
        {dragActive && (
          <Box className="drop-zone-overlay">
            <Box className="drop-zone">
              <p>Drop files here</p>
            </Box>
          </Box>
        )}
      </>
    )}
  </Container>	
	);
};

export default App;
