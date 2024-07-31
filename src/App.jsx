// import React, { useEffect, useState } from 'react';
// import init, { Protocol, JsNet } from "qwasm";

// const App = (protocol) => {
//   const [loading, setLoading] = useState("loading");

//   useEffect(() => {
//     init().then(() => {
//       setLoading("ready");
//       // returns an utf-8 encoded array of locked nodes
//       async function fetch_subtree(parent_id) {
//         // 1 gets a json-serialized array of locked nodes (RESPECT dirty) where parent = parent_id
//         // 2 utf8-encode to a byte array
//         // 3 return
//         // 4' may throw

//         // if (!response.ok) {
//           // throw new Error(JSON.stringify({
//           //   message: `HTTP error! status: ${response.status}`,
//           //   status: response.status,
//           //   recentHash: "exampleRecentHash"
//           // }));
//         // }

//         const data = [1, 2, 3]
//         const jsonString = JSON.stringify(data);

//         // Encode the JSON string to a byte array
//         const encoder = new TextEncoder();
//         const byteArray = encoder.encode(jsonString);

//         // Return the byte array
//         return byteArray;
//       }

//       // should throw or return an error
//       // accepts an array of utf-8 encoded json objects (NOT STRINGS)
//       async function upload_nodes(nodes) {
//         nodes.forEach(function (node) {
//           const encoder = new TextDecoder();
//           const ar = encoder.decode(node);
//           const node_json = JSON.parse(ar);

//           console.log("uploaded: " + node_json);
//         });
//       }

//       let god_json;
//       const pass = "123";
//       {
//         // create a callbacks object
//         // this will be consumed by register_as_god, hence we're in an isolated scope here
//         const net = new JsNet(fetch_subtree, upload_nodes);
//         // instantiate a protocol
//         let god = Protocol.register_as_god(pass, net);
//         god_json = god.json();
//       }

//       const net = new JsNet(fetch_subtree, upload_nodes);
//       let protocol = Protocol.unlock_with_pass(pass, god_json, net);
//       // let protocol = god.as_protocol();

//       function log_dir(dir) {
//         console.log("dir: " + dir.name())

//         console.log("breadcrumbs:");
//         dir.breadcrumbs().forEach(function (item) {
//           console.log(item.name());
//         });

//         console.log("children:")
//         dir.items().forEach(function (item) {
//           let ext = item.is_dir() ? "(dir)" : "." + item.ext();

//           console.log(item.name() + ext);
//         });
        
//         console.log("")
//       }

//       function genFile() {
//         const size = 1 * 1024 * 1024; // 1 MB in bytes
//         const buf = new Uint8Array(size);

//         // TODO: SharedArrayBuffer could be used to avoid copying, but it might require
//         // some server headers to be change for support

//         // redAFill the array with random values
//         for (let i = 0; i < size; i++) {
//           buf[i] = Math.floor(Math.random() * 256);
//         }

//         return buf;
//       }

//       async function simulateWork() {
//         try {
//           log_dir(await protocol.ls_cur_mut());

//           await protocol.mkdir("1");
//           log_dir(await protocol.ls_cur_mut());

//           let _2 = await protocol.mkdir("2");
//           log_dir(await protocol.ls_cur_mut());

//           console.log('cd-ing:');
//           log_dir(await protocol.cd_to_dir(_2));

//           console.log("cur ls:");
//           log_dir(await protocol.ls_cur_mut());

//           let _3 = await protocol.mkdir("3");
//           log_dir(await protocol.ls_cur_mut());

//           await protocol.cd_to_dir(_3);

//           for (let i = 0; i < 10; i++) {
//             await protocol.touch("file" + i, "png");
//           }

//           log_dir(await protocol.ls_cur_mut());

//           log_dir(await protocol.go_back())
//           log_dir(await protocol.go_back())
//           log_dir(await protocol.go_back())
//           log_dir(await protocol.go_back())

//           log_dir(await protocol.cd_to_dir(_3));

//           log_dir(await protocol.go_back())
//           log_dir(await protocol.go_back())

//           let file_id = await protocol.touch("encrypted", "txt");
//           const file = genFile();

//           let ct;
//           {
//             console.log("encrypting a file");

//             const starttime = performance.now();

//             ct = await protocol.encrypt_block_for_file(file, file_id);

//             const endtime = performance.now();

//             // calculate the time difference
//             const timetaken = endtime - starttime;
//             console.log(`time taken: ${timetaken} milliseconds; len: ` + ct.length);
//             // let pt = protocol.decrypt_block_for_file(ct, file_id);
//           }

//           {
//             console.log("decrypting a file");

//             const starttime = performance.now();
//             let pt = await protocol.decrypt_block_for_file(ct, file_id);
//             const endtime = performance.now();

//             // calculate the time difference
//             const timetaken = endtime - starttime;
//             console.log(`time taken: ${timetaken} milliseconds`);
//             // let pt = protocol.decrypt_block_for_file(ct, file_id);
//           }

//           {
//             console.log('encrypting & decrypting a file in chunks. file: ' + file.length)

//             const midpoint = Math.floor(file.length / 2);
//             let msg0 = file.slice(0, midpoint);
//             let msg1 = file.slice(midpoint);
            
//             const starttime = performance.now();

//             let ct0 = await protocol.chunk_encrypt_for_file(msg0, file_id, 0);
//             let ct1 = await protocol.chunk_encrypt_for_file(msg1, file_id, 1);

//             let pt0 = await protocol.chunk_decrypt_for_file(ct0, file_id, 0);
//             let pt1 = await protocol.chunk_decrypt_for_file(ct1, file_id, 1);

//             console.log("decrypted file size = " + (pt0.length + pt1.length));

//             const endtime = performance.now();

//             const timetaken = endtime - starttime;
//             console.log(`time taken: ${timetaken} milliseconds`);
//           }

//           {
//             console.log("announcements:");
//             const starttime = performance.now();

//             const msg_ct = await protocol.encrypt_announcement("hi there");
//             const endtime = performance.now();

//             // calculate the time difference
//             const timetaken = endtime - starttime;
//             console.log(`time taken: ${timetaken} milliseconds`);

//             console.log(msg_ct);

//             const msg = await protocol.decrypt_announcement(msg_ct);

//             console.log(msg);
//           }
//           // console.log(pt);
//         } catch (e) {
//           console.error("Error fetching current list:", e);
//         }
//       }

//       // Execute the function
//       simulateWork();
//     })
//   }, [])

//   return (
//     <div>
//       <p>{loading}</p>
//       <button>wow</button>
//     </div>
//   );
// };

// export default App;

///////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { FaFileWord, FaFilePdf, FaFileImage, FaFileVideo, FaFileArchive, FaFile, FaFolder } from 'react-icons/fa';
import './App.css';

// const files = [
//   { name: 'Company Contacts - Quantumzilla-2024.docx', type: 'document', createdAt: '17/04/2024 12:23 PM' },
//   { name: 'Incident Response Processes.pdf', type: 'document', createdAt: '17/04/2024 12:23 PM' },
//   { name: 'Screenshot 2023-07-04 at 12.10.14.png', type: 'image', createdAt: '17/04/2024 1:49 PM' },
//   { name: 'Incident #188.psd', type: 'document', createdAt: '17/04/2024 12:44 PM' },
//   { name: 'Screenshot 2023-09-09 at 18.29.10.png', type: 'image', createdAt: '17/04/2024 12:44 PM' },
//   { name: 'Screenshot 2023-09-09 at 18.29.10.mp4', type: 'video', createdAt: '17/04/2024 12:44 PM' },
//   { name: '???', type: 'file', createdAt: '17/04/2024 12:44 PM' },
//   { name: 'IR Team (Level 2).zip', type: 'archive', createdAt: '17/04/2024 12:44 PM' },
//   { name: 'Incident #238.doc', type: 'document', createdAt: '17/04/2024 12:44 PM' },
//   { name: 'Screenshot 2023-07-04 at 12.10.14.png', type: 'image', createdAt: '17/04/2024 12:44 PM' },
// ];

const mockSubtree = {
  name: "SubDir",
  items: [
      { id: 3, created_at: 1627489200, name: "file3.txt", ext: "txt" },
      { id: 4, created_at: 1627489200, name: "file4.txt", ext: "txt" },
  ],
};

export const rootDir = {
  name: "Root",
  items: [
      { id: 1, created_at: 1627489200, name: "file1.txt", ext: "txt" },
      { id: 2, created_at: 1627489200, name: "file2.txt", ext: "txt" },
      { id: 3, created_at: 1627489200, name: "SubDir", ext: null },
  ],
};

export const openDir = (dirName) => {
  console.log(`Opening directory: ${dirName}`);
  return mockSubtree; // Simulate opening a directory and returning its contents
};

export const openFile = (fileName) => {
  console.log(`Opening file: ${fileName}`);
};

const getIcon = (type) => {
  switch(type) {
    case 'document':
      return <FaFileWord />;
    case 'pdf':
      return <FaFilePdf />;
    case 'image':
      return <FaFileImage />;
    case 'video':
      return <FaFileVideo />;
    case 'archive':
      return <FaFileArchive />;
    case 'folder':
      return <FaFolder />;
    default:
      return <FaFile />;
  }
}

const App = () => {
  const [dragActive, setDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [currentDir, setCurrentDir] = useState(rootDir);

  const handleItemClick = (item) => {
      if (item.ext === null) {
          const newDir = openDir(item.name);
          setCurrentDir(newDir);
      } else {
          openFile(item.name);
      }
  };

  const getIcon = (item) => {
      return item.ext === null ? <FaFolder /> : <FaFile />;
  };

  const handleUpload = () => {
    console.log("Upload File Clicked");
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragCounter(0);

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

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [dragCounter]);

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Files</h1>
          <p>Upload and manage files and playbooks necessary for facilitating your response to incidents.</p>
        </div>
        <button className="upload-button" onClick={handleUpload}>Upload File</button>
      </div>
      <div className="table-container">
        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {/* {files.map((file, index) => (
              <tr key={index} onClick={() => handleItemClick(file)}>
                <td><span className="file-icon">{getIcon(file.type)}</span>{file.name}</td>
                <td>{file.createdAt}</td>
                <td>{file.type}</td>
              </tr>
            ))} */}
            {currentDir.items.map((item, index) => (
                            <tr key={index} onClick={() => handleItemClick(item)}>
                                <td>
                                    <span className="file-icon">{getIcon(item)}</span>
                                    {item.name}
                                </td>
                                <td>{new Date(item.created_at * 1000).toLocaleString()}</td>
                            </tr>
                        ))}
          </tbody>
        </table>
      </div>
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
