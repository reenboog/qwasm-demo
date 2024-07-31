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
		console.log("Upload File Clicked");

		const files = event.target.files;
		if (files.length > 0) {
			for (const file of files) {
				// Handle each file here
				// You can now call your functions to handle the file
				// id = touch()
				// ct = encrypt(content, id)
				// upload(ct)
				const ext = mime.getExtension(file.type);

				console.log(`File selected: ${file.name}`);
				console.log(`Last modified: ${new Date(file.lastModified)}`);
				console.log(`Size: ${file.size} bytes`);
				console.log(`Type: ${file.type}`);
				console.log(`Ext: ${ext}`);

				let pt = new Uint8Array(await file.arrayBuffer());
				console.log("about to encryot tp.len = ", pt.length);

				let id = await protocol.touch(file.name, ext);
				let ct = await protocol.encrypt_block_for_file(pt, id);

				console.log("encrypted ct.len = ", ct.length);

				await uploadFile(id, ct);
			}
		}

		setCurrentDir(await protocol.ls_cur_mut());
	};

	const uploadFile = async (id, ct) => {
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