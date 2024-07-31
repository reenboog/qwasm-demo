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
import Breadcrumbs from './Breadcrumbs';
import './App.css';

const branches = {
  0: {
    name: "/",
    items: [
      { id: 1, created_at: new Date(), name: "1", ext: null },
      { id: 2, created_at: new Date(), name: "2", ext: null },
      { id: 3, created_at: new Date(), name: "3", ext: null },
      { id: 4, created_at: new Date(), name: "4", ext: "txt" },
      { id: 5, created_at: new Date(), name: "5", ext: "jpg" },
      { id: 6, created_at: new Date(), name: "6", ext: "zip" },
      { id: 7, created_at: new Date(), name: "7", ext: "pdf" },
      { id: 8, created_at: new Date(), name: "8", ext: "rar" },
    ],
    breadcrumbs: [
    ]
  },
  1: {
    name: "1",
    items: [
      { id: 11, created_at: new Date(), name: "11", ext: null },
      { id: 12, created_at: new Date(), name: "12", ext: "mov" },
      { id: 13, created_at: new Date(), name: "13", ext: "doc" },
      { id: 14, created_at: new Date(), name: "14", ext: "mp4" },
    ],
    breadcrumbs: [
      { id: 0, name: "/" }
    ]
  },
  11: {
    name: "11",
    items: [
      { id: 111, created_at: new Date(), name: "111", ext: "pdf" },
      { id: 112, created_at: new Date(), name: "112", ext: "txt" },
    ],
    breadcrumbs: [
      { id: 1, name: "1" },
      { id: 0, name: "/" }
    ]
  },
  2: {
    name: "2",
    items: [
      { id: 21, created_at: new Date(), name: "21", ext: "pdf" },
      { id: 22, created_at: new Date(), name: "22", ext: null },
    ],
    breadcrumbs: [
      { id: 0, name: "/" }
    ]
  },
  22: {
    name: "22",
    items: [
      { id: 221, created_at: new Date(), name: "221", ext: null },
      { id: 222, created_at: new Date(), name: "222", ext: null },
    ],
    breadcrumbs: [
      { id: 2, name: "2" },
      { id: 0, name: "/" }
    ]
  },
  221: {
    name: "221",
    items: [
    ],
    breadcrumbs: [
      { id: 22, name: "22" },
      { id: 2, name: "2" },
      { id: 0, name: "/" }
    ]
  },
  222: {
    name: "222",
    items: [
      { id: 2221, created_at: new Date(), name: "2221", ext: "png" },
      { id: 2222, created_at: new Date(), name: "2222", ext: "mp4" },
      { id: 2223, created_at: new Date(), name: "2222", ext: "dmg" },
    ],
    breadcrumbs: [
      { id: 22, name: "22" },
      { id: 2, name: "2" },
      { id: 0, name: "/" }
    ]
  },
  3: {
    name: "3",
    items: [
      { id: 31, created_at: new Date(), name: "31", ext: "docx" },
      { id: 32, created_at: new Date(), name: "32", ext: "txt" },
      { id: 33, created_at: new Date(), name: "33", ext: null },
    ],
    breadcrumbs: [
      { id: 0, name: "/" }
    ]
  },
  33: {
    name: "33",
    items: [
      { id: 331, created_at: new Date(), name: "331", ext: "docx" },
      { id: 332, created_at: new Date(), name: "332", ext: "doc" },
    ],
    breadcrumbs: [
      { id: 3, name: "3" },
      { id: 0, name: "/" }
    ]
  },
}

export const openDir = (id) => {
  console.log(`Opening directory: ${id}`);
  return branches[id]
};

export const openFile = (id) => {
  console.log(`Opening file: ${id}`);
};

const getIcon = (ext) => {
  if (ext === null) {
    return <FaFolder className="folder-icon" />;
  }
  switch (ext) {
    case 'doc':
    case 'docx':
      return <FaFileWord className="word-icon" />;
    case 'pdf':
      return <FaFilePdf className="pdf-icon" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <FaFileImage className="image-icon" />;
    case 'mp4':
    case 'mov':
      return <FaFileVideo className="video-icon" />;
    case 'zip':
    case 'rar':
      return <FaFileArchive className="archive-icon" />;
    default:
      return <FaFile className="file-icon" />;
  }
};

const App = () => {
  const [dragActive, setDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [currentDir, setCurrentDir] = useState(branches[0]);

  const handleItemClick = (item) => {
    if (item.ext === null) {
      const newDir = openDir(item.id);
      setCurrentDir(newDir);
    } else {
      openFile(item.id);
    }
  };

  const handleBackClick = () => {
    let dir = branches[currentDir.breadcrumbs[0].id]

    setCurrentDir(dir)
  };

  const handleBreadcrumbClick = (id) => {
    setCurrentDir(branches[id]);
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
          {/* <h1>Files</h1> */}
          {/* <p>Upload and manage files and playbooks necessary for facilitating your response to incidents.</p> */}
        </div>
        {/* <button className="upload-button" onClick={handleUpload}>Upload File</button> */}
      </div>
      <div className="table-container">
        <table className="file-table">
          <thead>
            <Breadcrumbs
              breadcrumbs={currentDir.breadcrumbs}
              currentDirName={currentDir.name}
              onBreadcrumbClick={handleBreadcrumbClick}
              onUploadClick={handleUpload}
            />
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {currentDir.breadcrumbs.length !== 0 && (
              <tr key="back" onClick={handleBackClick}>
                <td colSpan="3">
                  <span className="file-icon">{getIcon(null)}</span>
                  {".."}
                </td>
              </tr>
            )}
            {currentDir.items.map((item, index) => (
              <tr key={index} onClick={() => handleItemClick(item)}>
                <td>
                  <span className="file-icon">{getIcon(item.ext)}</span>
                  {item.name}
                </td>
                <td>{item.created_at.toLocaleString()}</td>
                <td>{item.ext ?? "dir"}</td>
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
