import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import useDragAndDrop from './useDragAndDrop';
import init, { Protocol, JsNet } from 'qwasm';
import AuthPage from './AuthPage';
import mime from 'mime';
import Workspace from './Workspace';
import './App.css';
import { genThumb } from './utils';
import { netCallbacks, domain, host } from './net_callbacks';

const ptChunkSize = 1024 * 1024;
const aesAuthTagSize = 16;
const ctChunkSize = ptChunkSize + aesAuthTagSize;
let cached_files = {};
let cached_thumbs = {};
const rpName = 'Mode Vault';
const rpId = domain;

const State = {
	Checking: 'CHECKING',
	Restoring: 'RESTORING',
	Authenticating: 'AUTHENTICATING',
	Ready: 'READY',
	Unauthenticated: 'UNAUTHENTICATED'
};

const App = () => {
	const [currentDir, setCurrentDir] = useState(null);
	const [protocol, setProtocol] = useState(null);
	const [progress, setProgress] = useState({});
	const [thumbs, setThumbs] = useState({});
	const [state, setState] = useState(State.Checking);
	const [net, setNet] = useState(null);
	const [mountKey, setMountKey] = useState(0);

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

		// if cached open
		// otherwise start downloading and updating progress
		let type = mime.getType(currentDir.items().find((file) => file.id() === id).ext());
		let bytes = cached_files[id];

		if (!bytes) {
			console.log('no byyes');

			const fileSize = await getFileSize(id);
			console.log(`file size = ${fileSize}`);

			bytes = await downloadFileInRanges(id, fileSize);

			if (!cached_thumbs[id] && ['image/jpeg', 'image/png', 'image/gif', 'image/avif', 'image/webp'].includes(type)) {
				const blob = new Blob([bytes], { type: type });
				const thumb = await genThumb(blob);
				cached_thumbs[id] = thumb;

				console.log('setting thumb');
				// does not rerender
				setThumbs((prev) => ({
					...prev,
					[id]: thumb
				}));
			}
		}

		const blob = new Blob([bytes], { type: type });
		const fileUrl = URL.createObjectURL(blob);

		window.open(fileUrl);
	};

	const processFiles = async (files) => {
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

				if (['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'].includes(ext.toLowerCase())) {
					const thumb = await genThumb(file);
					cached_thumbs[id] = thumb;

					setThumbs((prev) => ({
						...prev,
						[id]: thumb
					}));
				}

				setCurrentDir(await protocol.ls_cur_mut());

				fileIds.push({ id, file });
			}

			await Promise.all(fileIds.map(({ id, file }) => uploadFileInRanges(id, file)));
			// fileIds.map(({ id, file }) => uploadFileInBulk(id, file))
			// fileIds.map(({ id, file }) => uploadFileInStream(id, file))
		}
	};

	const handleUpload = async (event) => {
		const files = event.target.files;
		await processFiles(files);
	};

	const handleDrop = async (e) => {
		e.preventDefault(); // Prevent default behavior (Prevent file from being opened)

		const droppedItems = e.dataTransfer.items;
		const files = [];

		for (let i = 0; i < droppedItems.length; i++) {
			const item = droppedItems[i].webkitGetAsEntry();
			if (item && item.isFile) {
				files.push(droppedItems[i].getAsFile());
			}
		}

		await processFiles(files);
	};

	const getFileSize = async (id) => {
		const res = await fetch(`${host}/uploads/${id}`, {
			method: 'HEAD',
			headers: {
				'Content-Type': 'application/json',
				'x-uploader-auth': 'aabb1122', // Replace with your auth token
			},
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch file sie: ${res.statusText}`);
		}

		const contentLength = res.headers.get('Content-Length');
		if (!contentLength) {
			throw new Error('Content-Length header is missing');
		}

		return contentLength;
	};

	const downloadFileInRanges = async (id, fileSize) => {
		let downloaded = 0;
		const ptFileSize = Math.ceil(fileSize / ctChunkSize) * ctChunkSize;
		let pt = { offset: 0, data: new Uint8Array(ptFileSize) };
		let chunkIdx = 0;

		// FIXME: respect already downloaded content and predecrypt it into cache

		while (downloaded < fileSize) {
			const rangeStart = downloaded;
			const rangeEnd = Math.min(downloaded + ctChunkSize - 1, fileSize - 1);

			const chunk = await downloadChunk(id, rangeStart, rangeEnd);
			const decrypted = await protocol.chunk_decrypt_for_file(new Uint8Array(await chunk.arrayBuffer()), id, chunkIdx);

			pt.data.set(decrypted, pt.offset);
			pt.offset += decrypted.byteLength;
			cached_files[id] = pt.data;

			downloaded += chunk.size;
			chunkIdx += 1;

			setProgress((prev) => ({
				...prev,
				[id]: { val: (downloaded / fileSize) * 100, pending: downloaded != fileSize, cached: downloaded == fileSize }
			}));

			console.log(`Downloaded chunk ${rangeStart}-${rangeEnd} (${chunk.size} bytes)`);
		}

		return pt.data;
	};

	const downloadChunk = async (id, start, end) => {
		const url = `${host}/uploads/chunk/${id}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Range': `bytes=${start}-${end}`,
				'x-uploader-auth': 'aabb1122', // Replace with your auth token
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to download chunk: ${response.statusText}`);
		}

		return response.blob();
	};

	const handleRowClick = async (item) => {
		if (item.is_dir()) {
			await openDir(item.id());
		} else {
			await openFile(item.id());
		}
	};

	const handleLogoutClick = async () => {
		console.log('logging off...');

		await protocol.logout();

		setState(State.Unauthenticated);
		setMountKey(prevKey => prevKey + 1);
	};

	const handleBackClick = async () => {
		setCurrentDir(await protocol.go_back());
	};

	const handleBreadcrumbClick = async (id) => {
		await openDir(id);
	};

	const handleAddUser = async (email, pin) => {
		console.log('add user' + email + ' ' + pin);

		try {
			await protocol.invite_with_all_seeds_for_email(email, pin);
		} catch (e) {
			console.log(`Failed to add user: ${e}`);
		}
	}

	const uploadFileInRanges = async (id, file) => {
		const numChunks = Math.ceil(file.size / ptChunkSize);
		let readOffset = 0;
		let chunkIdx = 0;
		let encryptedOffset = 0;
		// IMPORTANT: aes gcm is used, so auth tag is appended to the end of each chunk! It makes encrypted
		// chunks 16 bytes larger than plain text ones; therefore, when downloading & decrypting,
		// add aes auth tag (16 bytes) to chunk_size first
		const encryptedFileSize = file.size + numChunks * aesAuthTagSize;

		let toCache = { offset: 0, data: new Uint8Array(file.size) };
		if (readOffset > 0) {
			// ok, read the first readOffset bytes of what we suposedly have into a cache
			toCache.data.set(new Uint8Array(await file.slice(0, readOffset).arrayBuffer()), 0);
			toCache.offset += readOffset;
		}

		while (readOffset < file.size) {
			const chunk = new Uint8Array(await file.slice(readOffset, readOffset + ptChunkSize).arrayBuffer());
			const encrypted = await protocol.chunk_encrypt_for_file(chunk, id, chunkIdx);

			await uploadChunk(encrypted, encryptedOffset, encryptedFileSize, id);

			encryptedOffset += encrypted.byteLength;
			chunkIdx += 1;

			toCache.data.set(chunk, toCache.offset);
			toCache.offset += chunk.byteLength;
			cached_files[id] = toCache.data;

			setProgress((prev) => ({
				...prev,
				[id]: { val: (chunkIdx / numChunks) * 100, pending: chunkIdx != numChunks, cached: chunkIdx == numChunks }
			}));

			console.log(`${file.name} Uploaded chunk ${chunkIdx} / ${numChunks} of file ${file.name}; pending: ${(chunkIdx != numChunks)}`);

			readOffset += ptChunkSize;
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

		let toCache = { offset: 0, data: new Uint8Array(file.size) };
		if (readOffset > 0) {
			// ok, read the first readOffset bytes of what we suposedly have into a cache
			toCache.data.set(new Uint8Array(await file.slice(0, readOffset).arrayBuffer()), 0);
			toCache.offset += readOffset;
		}

		const stream = new ReadableStream({
			start(controller) {
				let chunkIdx = 0;

				const push = async () => {
					if (readOffset < file.size) {
						try {
							const chunk = new Uint8Array(await file.slice(readOffset, readOffset + ptChunkSize).arrayBuffer());
							const encrypted = await protocol.chunk_encrypt_for_file(chunk, id, chunkIdx);

							controller.enqueue(encrypted);
							readOffset += ptChunkSize;

							toCache.data.set(chunk, toCache.offset);
							toCache.offset += chunk.byteLength;
							cached_files[id] = toCache.data;

							setProgress(prev => ({
								...prev,
								[id]: { val: (readOffset / fileSize) * 100, pending: toCache.data.length != fileSize, cached: toCache.data.length == fileSize }
							}));

							console.log(`enqueued ${ptChunkSize}, uploaded ${readOffset}`)

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

		cached_files[id] = data;

		setProgress(prev => ({
			...prev,
			[id]: { val: 100, pending: false, cached: true }
		}));

		console.log(`File upload completed for ${file.name}`);
	};

	const handleAddDir = async (name) => {
		await protocol.mkdir(name);

		setCurrentDir(await protocol.ls_cur_mut());
	};

	const dragActive = useDragAndDrop(handleDrop);

	const handleSignup = async (email, pass, pin, rememberMe) => {
		setState(State.Authenticating);
		console.log('signup')

		try {
			let protocol;

			if (pin) {
				protocol = await Protocol.register_as_admin(email, pass, pin, net, rememberMe);
			} else {
				protocol = await Protocol.register_as_god(email, pass, net, rememberMe);
			}

			setState(State.Ready);
			setProtocol(protocol);
			setCurrentDir(await protocol.ls_cur_mut());
		} catch (e) {
			console.log(`Error signing up: ${e}`);
			alert('Failed to signup');
			setState(State.Unauthenticated);
		}
	}

	const handleLogin = async (email, pass, rememberMe) => {
		setState(State.Authenticating);
		console.log('login')

		try {
			const protocol = await Protocol.unlock_with_pass(email, pass, net, rememberMe);

			setState(State.Ready);
			setProtocol(protocol);
			setCurrentDir(await protocol.ls_cur_mut());
		} catch (e) {
			console.log(`Error logging in: ${e}`);
			alert('Failed to login');
			setState(State.Unauthenticated);
		}
	}

	const handleRegisterPasskey = async () => {
		console.log('registering passkey');

		try {
			// FIXME: user a real password
			await protocol.register_passkey("my YK", "123", "Alex", rpName, rpId);

			console.log(`registered`);
		} catch (e) {
			alert('Failed to register passkey');
			console.log('Error registering passkey');
		}

		// FIXME: fetch passkey list
	};

	const handleAuthPaskey = async (rememberMe) => {
		console.log('authenticating');

		try {
			const protocol = await Protocol.auth_passkey(rpId, net, rememberMe);
			console.log('authenticated');

			setState(State.Ready);
			setProtocol(protocol);
			setCurrentDir(await protocol.ls_cur_mut());
		} catch (e) {
			console.log(`Error authenticating with passkey: ${e}`);

			const network = netCallbacks();
			setNet(network);
			setState(State.Unauthenticated);
		}
	}

	useEffect(() => {
		const restoreSessionIfAny = async () => {
			setState(State.Checking);
			await init();

			try {
				setState(State.Restoring);
				const network = netCallbacks();
				setNet(network);
				const protocol = await Protocol.unlock_session_if_any(network);

				setProtocol(protocol);
				setCurrentDir(await protocol.ls_cur_mut());
				setState(State.Ready);
			} catch (error) {
				console.log('no session found', error);

				const network = netCallbacks();
				setNet(network);
				setState(State.Unauthenticated);
			}
		};

		// TODO: check pending updates and populate progress

		// FIXME: load thumbs from a local cache
		setThumbs(cached_thumbs);
		setProgress({});
		cached_files = {};

		restoreSessionIfAny();
	}, [mountKey]);

	return (
		<>
			{state === State.Checking && (
				<></>
			)}
			{state === State.Restoring && (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
					restoring session...
				</Box>
			)}
			{state === State.Authenticating && (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
					authenticating...
				</Box>
			)}
			{state === State.Unauthenticated && (
				<AuthPage onSignupClick={handleSignup} onLoginClick={handleLogin} onAuthPasskey={handleAuthPaskey} />
			)}
			{state === State.Ready && protocol !== null && currentDir !== null && (
				<Workspace
					currentDir={currentDir}
					onItemClick={handleRowClick}
					onBackClick={handleBackClick}
					onBreadcrumbClick={handleBreadcrumbClick}
					onAddUserClick={handleAddUser}
					onUploadClick={handleUpload}
					onAddDirClick={handleAddDir}
					onLogout={handleLogoutClick}
					onRegisterPasskey={handleRegisterPasskey}
					progress={progress}
					thumbs={thumbs}
					dragActive={dragActive}
					name={null} // you may have a name at this point
				/>
			)}
		</>
	);
};

export default App;
