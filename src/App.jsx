import React, { useEffect, useState } from 'react';
import FileTable from './FileTable';
import Loader from './Loader';
import useDragAndDrop from './useDragAndDrop';
import init, { Protocol, JsNet } from "qwasm";
import mime from 'mime';

import './App.css';

let nodeIdx = 1;
let pass = "god pass";
let uploads = {};

const App = () => {
	const [currentDir, setCurrentDir] = useState(null);
	const [protocol, setProtocol] = useState(null);

	const openDir = async (id) => {
		console.log(`Opening directory: ${id}`);

		try {
			setCurrentDir(await protocol.cd_to_dir(id));
		} catch (e) {
			console.error("error ls-ing a dir:", e);
		}
	};

	const openFile = async (id) => {
		console.log(`Opening file: ${id}`);

		// download
		// decrypt
		// build
		// open
		let ct = uploads[id];
		let type = mime.getType(currentDir.items().find(file => file.id() === id).ext());

		console.log("ct.len = ", ct.length);

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

	const handleUpload = async (event) => {
		const files = event.target.files;

		if (files.length > 0) {
			const fileIds = await Promise.all(
				Array.from(files).map(async (file) => {
					const ext = mime.getExtension(file.type);

					console.log(`File selected: ${file.name}`);
					console.log(`Last modified: ${new Date(file.lastModified)}`);
					console.log(`Size: ${file.size} bytes`);
					console.log(`Type: ${file.type}`);
					console.log(`Ext: ${ext}`);

					let pt = new Uint8Array(await file.arrayBuffer());
					console.log("about to encrypt pt.len = ", pt.length);

					let id = await protocol.touch(file.name, ext);
					
					setCurrentDir(await protocol.ls_cur_mut());

					return { id, file };
				})
			);

			await Promise.all(
				fileIds.map(({ id, file }) => uploadFileInRanges(id, file))
			);
		}
	};

	const uploadFileInRanges = async (id, file) => {
		const chunkSize = 4 * 1024 * 1024; // 1MB chunk size
		const url = "https://quku.live:5050/upload_ranged";
		let offset = 0;
		const totalChunks = Math.ceil(file.size / chunkSize);
		let chunkIdx = 0;

		while (offset < file.size) {
			const chunk = file.slice(offset, offset + chunkSize);
			const encryptedChunk = await protocol.chunk_encrypt_for_file(new Uint8Array(await chunk.arrayBuffer()), id, chunkIdx);

			await uploadChunk(encryptedChunk, offset, file.size, url, id);

			offset += chunkSize;
			chunkIdx += 1;

			console.log(`${file.name} Uploaded chunk ${offset / chunkSize}/${totalChunks} of file ${file.name}`);
		}

		console.log(`File upload completed for ${file.name}`);
	};

	const uploadChunk = async (chunk, offset, fileSize, url, id) => {
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
		// const chunkSize = 1024 * 1024; // 1MB chunk size
		const chunkSize = 16375;
		const url = "https://quku.live:5050/upload";
		const fileId = id;

		async function encryptChunk(chunk) {
			// TODO: implement me
			return new Uint8Array(chunk);
		}

		async function readFileChunk(file, offset, chunkSize) {
			return new Promise((resolve, reject) => {
				const chunk = file.slice(offset, offset + chunkSize);
				const reader = new FileReader();

				reader.onload = (e) => resolve(e.target.result);
				reader.onerror = (e) => reject(e.target.error);

				reader.readAsArrayBuffer(chunk);
			});
		}

		const stream = new ReadableStream({
			start(controller) {
				let offset = 0;

				const push = async () => {
					if (offset < file.size) {
						try {
							const chunkData = await readFileChunk(file, offset, chunkSize);
							const encryptedChunk = await encryptChunk(chunkData);

							controller.enqueue(encryptedChunk);
							offset += chunkSize;

							console.log(`enqueued ${chunkSize}, uploaded ${offset}`)

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
					'x-uploader-auth': 'aabb1122', // Replace with your auth token
				},
				body: stream,
				duplex: 'half'  // Required for streaming requests
			});

			if (!response.ok) {
				console.error(`Failed to upload file: ${response.statusText}`);
			}
		} catch (error) {
			console.error(`Error uploading file:`, error);
		}

	};

	const uploadFileInBulk = async (id, ct) => {
		// TODO: implement me
		uploads[id] = ct;
	};

	const handleDirAdd = async () => {
		await protocol.mkdir("dir_" + nodeIdx);

		nodeIdx += 1;

		setCurrentDir(await protocol.ls_cur_mut());
	};

	const handleDrop = async (e) => {
		const droppedItems = e.dataTransfer.items;

		const logNode = async (entry, path = "") => {
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
		// 1 gets a json-serialized array of locked nodes (RESPECT dirty) where parent = parent_id
		// 2 utf8-encode to a byte array
		// 3 return
		// 4' may throw

		// if (!response.ok) {
		// throw new Error(JSON.stringify({
		//   message: `HTTP error! status: ${response.status}`,
		//   status: response.status,
		//   recentHash: "exampleRecentHash"
		// }));
		// }

		const data = [1, 2, 3]
		const jsonString = JSON.stringify(data);

		// Encode the JSON string to a byte array
		const encoder = new TextEncoder();
		const byteArray = encoder.encode(jsonString);

		// Return the byte array
		return byteArray;
	};

	const uploadNodes = async (nodes) => {
		nodes.forEach(function (node) {
			const encoder = new TextDecoder();
			const ar = encoder.decode(node);
			const node_json = JSON.parse(ar);

			console.log("uploaded: " + node_json);
		});
	}

	useEffect(async () => {
		await init();
		console.log("loaded");

		const net = new JsNet(fetchSubtree, uploadNodes);
		const god = Protocol.register_as_god(pass, net);
		const protocol = god.as_protocol();

		setProtocol(protocol);
		setCurrentDir(await protocol.ls_cur_mut());
	}, []);

	return (
		<div className="app">
			{protocol !== null && currentDir !== null ? <FileTable
				currentDir={currentDir}
				handleItemClick={handleItemClick}
				handleBackClick={handleBackClick}
				handleBreadcrumbClick={handleBreadcrumbClick}
				handleUpload={handleUpload}
				handleDirAdd={handleDirAdd}
			/> : <Loader />}
			{dragActive && (
				<div className="drop-zone-overlay">
					<div className="drop-zone">
						<p>Drop files here</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;