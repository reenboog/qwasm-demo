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

// s3 suggested min chunk size is 5MB
const aesAuthTagSize = 16;
// { base64: Uint8Array }
let cached_files = {};
// { base64: Uint8Array }
let cached_thumbs = {};
const rpName = 'Mode Vault';
const rpId = domain;

const State = {
	Checking: 'CHECKING',
	Restoring: 'RESTORING',
	Authenticating: 'AUTHENTICATING',
	Ready: 'READY',
	Acked: 'ACKED',
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
		console.log(`Opening directory: ${id.js_val()}`);

		try {
			setCurrentDir(await protocol.cd_to_dir(id));
		} catch (e) {
			console.error('error ls-ing a dir:', e);
		}
	};

	const handleItemDelete = async (node) => {
		console.log(`deleting node: ${node.id().js_val()}`);

		await protocol.delete_node(node.id());
		
		setCurrentDir(await protocol.ls_cur_mut());
	}

	// id: Uid
	const openFile = async (id) => {
		console.log(`Opening file: ${id.js_val()}`);

		// if cached open
		// otherwise start downloading and updating progress
		let type = mime.getType(currentDir.items().find((file) => file.id().js_val() == id.js_val()).ext());
		let bytes = cached_files[id.js_val()];

		if (!bytes) {
			console.log('no bytes');

			const fileInfo = await getFileInfo(id);

			let url, encAlg, chunkSize, parts, fileSize;

			if (fileInfo.status.Ready) {
				url = fileInfo.status.Ready.url;
				encAlg = fileInfo.enc_alg;
				chunkSize = fileInfo.chunk_size;
				fileSize = fileInfo.status.Ready.content_length;

				console.log(`url = ${url}, encAlg = ${encAlg}, chunkSize = ${chunkSize}, fileSize = ${fileSize}`);
				bytes = await downloadFileMultipart(id, url, fileSize, chunkSize, encAlg);

				if (!cached_thumbs[id.js_val()] && ['image/jpeg', 'image/png', 'image/gif', 'image/avif', 'image/webp'].includes(type)) {
					const blob = new Blob([bytes], { type: type });
					const thumb = await genThumb(blob);
					cached_thumbs[id.js_val()] = thumb;

					console.log('setting thumb');
					// does not rerender
					setThumbs((prev) => ({
						...prev,
						[id.js_val()]: thumb
					}));
				}

				await openFileInMemWithData(type, bytes);
			} else if (fileInfo.status.Pending) {
				// an incomplete upload; reupload, if possible
				parts = fileInfo.status.Pending.parts;
				encAlg = fileInfo.enc_alg;
				chunkSize = fileInfo.chunk_size;

				console.log(`file incomplete: parts = ${JSON.stringify(parts)}, encAlg = ${encAlg}, chunkSize = ${chunkSize}`);
			}
		} else {
			await openFileInMemWithData(type, bytes);
		}
	};

	const openFileInMemWithData = async (type, data) => {
		const blob = new Blob([data], { type: type });
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

				// id: Uid
				let id = await protocol.touch(file.name, ext);

				if (['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'].includes(ext.toLowerCase())) {
					const thumb = await genThumb(file);
					cached_thumbs[id.js_val()] = thumb;

					setThumbs((prev) => ({
						...prev,
						[id.js_val()]: thumb
					}));
				}

				setCurrentDir(await protocol.ls_cur_mut());

				fileIds.push({ id, file });
			}

			await Promise.all(fileIds.map(({ id, file }) => uploadFileMultipart(id, file)));
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

	// id: Uid
	const getFileInfo = async (id) => {
		const res = await fetch(`${host}/uploads/info/${id.js_val()}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
				// 'x-uploader-auth': 'aabb1122', // Replace with your auth token
			},
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch file sie: ${res.statusText}`);
		}

		const info = await res.json();

		console.log(`file info = ${JSON.stringify(info)}`);

		return info;
	};

	// id: Uid
	const downloadFileMultipart = async (id, url, fileSize, chunkSize, encAlg) => {
		let downloaded = 0;
		const ctChunkSize = chunkSize + aesAuthTagSize;
		const numChunks = Math.ceil(fileSize / ctChunkSize);
		// IMPORTANT: this works only for aes-gcm; respect other auth AEADs, if any
		const ptFileSize = fileSize - (numChunks * aesAuthTagSize);
		let pt = { offset: 0, data: new Uint8Array(ptFileSize) };
		let chunkIdx = 0;

		// FIXME: respect already downloaded content and predecrypt it into cache

		while (downloaded < fileSize) {
			const rangeStart = downloaded;
			const rangeEnd = Math.min(downloaded + ctChunkSize - 1, fileSize - 1);

			const res = await fetch(url, {
				method: 'GET',
				headers: {
					'Range': `bytes=${rangeStart}-${rangeEnd}`,
				}
			});

			const chunk = await res.arrayBuffer();
			const decrypted = await protocol.chunk_decrypt_for_file(new Uint8Array(chunk), id, chunkIdx);

			pt.data.set(decrypted, pt.offset);
			pt.offset += decrypted.byteLength;
			cached_files[id.js_val()] = pt.data;

			downloaded += chunk.byteLength;
			chunkIdx += 1;

			setProgress((prev) => ({
				...prev,
				[id.js_val()]: { val: (downloaded / fileSize) * 100, pending: downloaded != fileSize, cached: downloaded == fileSize }
			}));

			console.log(`Downloaded chunk ${rangeStart}-${rangeEnd} (${chunk.byteLength} bytes)`);
		}

		return pt.data;
	};

	// id: Uid
	const downloadChunk = async (id, start, end) => {
		const url = `${host}/uploads/chunk/${id.js_val()}`;
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

		// RECONSIDER: if protocol != NULL?
		await protocol.logout();

		setState(State.Unauthenticated);
		setMountKey(prevKey => prevKey + 1);
	};

	const handleBackClick = async () => {
		setCurrentDir(await protocol.go_back());
	};

	// id: Uid
	const handleBreadcrumbClick = async (id) => {
		await openDir(id);
	};

	const handleAddUser = async (email, pin) => {
		console.log('add user' + email + ' ' + pin);

		try {
			// RECONSIDER: rely on a flag here
			// await protocol.invite_with_all_seeds_for_email(email, pin);
			await protocol.invite_with_all_seeds_for_email_no_pin(email);
		} catch (e) {
			console.log(`Failed to add user: ${e}`);
		}
	}

	// id: Uid
	const uploadFileMultipart = async (id, file) => {
		let readOffset = 0;
		let toCache = { offset: 0, data: new Uint8Array(file.size) };
		if (readOffset > 0) {
			// ok, read the first readOffset bytes of what we suposedly have into a cache
			toCache.data.set(new Uint8Array(await file.slice(0, readOffset).arrayBuffer()), 0);
			toCache.offset += readOffset;
		}

		let url = `${host}/uploads/start/${id.js_val()}`;
		let response = await fetch(url, {
			method: 'POST',
			headers: {
			// 	'x-uploader-auth': 'aabb1122', // Replace with your auth token
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ file_size: file.size })
		});

		if (!response.ok) {
			throw new Error(`Failed to upload chunk: ${response.statusText}`);
		}

		let res = await response.json();
		console.log(`json: ${JSON.stringify(res)}`);

		// const storedState = getUploadStateFromLocalStorage(file.name);
		let uploadId = res.id;
		let presignedUrls = res.chunk_urls;
		let numChunks = presignedUrls.length;
		let chunkSize = res.chunk_size;
		let progress = 0;
		const parts = [];
		// find the best value for the given connection
		// FIXME: keep global in case more than one file is being uploaded
		const maxConcurrentUploads = 3;
		let activeUploads = [];

		for (let chunkIdx = 0; chunkIdx < numChunks; chunkIdx++) {
			// TODO: parallelize this
			const readOffset = chunkIdx * chunkSize;
			const chunk = new Uint8Array(await file.slice(readOffset, readOffset + chunkSize).arrayBuffer());
			const encrypted = await protocol.chunk_encrypt_for_file(chunk, id, chunkIdx);
			
			toCache.data.set(chunk, toCache.offset);
			toCache.offset += chunk.byteLength;
			cached_files[id.js_val()] = toCache.data;

			// etags are indexed from 1
			if (!parts.some(part => part.PartNumber === chunkIdx)) {
				const uploadChunk = async (chunkIdx, data) => {
					let success = false;
					let retries = 0;
					const maxRetries = 3;

					while (!success && retries < maxRetries) {
						try {
							const response = await fetch(presignedUrls[chunkIdx], {
								method: 'PUT',
								body: data,
							});

							if (response.ok) {
								const eTag = response.headers.get('ETag');

								parts.push({ ETag: eTag, idx: chunkIdx });
								progress += 1;
								// saveUploadStateToLocalStorage(file.name, uploadId, uploadedParts);

								success = true;
							} else {
								throw new Error(`Failed to upload part ${chunkIdx}`);
							}
						} catch (error) {
							retries++;
							console.error(`Error uploading chunk ${chunkIdx}, retrying... (${retries}/${maxRetries})`);
						}
					}

					if (!success) {
						console.error(`Failed to upload chunk ${chunkIdx} after ${maxRetries} retries.`);
						// Optionally handle failure here (e.g., notify the user)
					}
					
					console.log(`${file.name} Uploaded chunk ${progress} / ${numChunks} of file ${file.name}; pending: ${(progress != numChunks)}`);
					
					setProgress((prev) => ({
						...prev,
						[id.js_val()]: { val: (progress / numChunks) * 100, pending: progress != numChunks, cached: progress == numChunks }
					}));

				};

				activeUploads.push(uploadChunk(chunkIdx, encrypted));
			}

			// throttle uploads
			if (activeUploads.length >= maxConcurrentUploads) {
				await Promise.all(activeUploads);
				activeUploads = [];
			}
		}

		//  finish remaining uploads, if any
		if (activeUploads.length > 0) {
			await Promise.all(activeUploads);
		}

		// clearUploadStateFromLocalStorage(file.name);

		console.log(`calling finish_upload`);

		url = `${host}/uploads/finish/${id.js_val()}`;
		
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(
				{
					upload_id: uploadId, 
					// etags are indexed from 1
					parts: parts.map(part => ({ part_number: part.idx + 1, e_tag: part.ETag }))
				}
			)
		});

		if (!response.ok) {
			throw new Error(`Failed to upload chunk: ${response.statusText}`);
		}

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
				// RECONSIDER: return a protocol, but check its inner field – `is_pending_signup()`
				// no pin signup is possible, but it won't return a Protocol instance
				// protocol = await Protocol.register_as_admin_with_pin(email, pass, pin, net, rememberMe);
				await Protocol.register_as_admin_no_pin(email, pass, net, rememberMe);
				setState(State.Acked);
			} else {
				protocol = await Protocol.register_as_god(email, pass, net, rememberMe);
				setState(State.Ready);
				setProtocol(protocol);
				setCurrentDir(await protocol.ls_cur_mut());
			}
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
			{/* RECONSIDER: rely on protocol.is_pending_signup */}
			{state === State.Acked && (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
					Be patient, unworthy one. God has been notified.
				</Box>
			)}
			{state === State.Ready && protocol !== null && currentDir !== null && (
				<Workspace
					currentDir={currentDir}
					onItemClick={handleRowClick}
					onItemDelete={handleItemDelete}
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
