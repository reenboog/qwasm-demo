import React, { useEffect, useState } from 'react';
// import init, { User, register_as_god, add, mul, sub, pow2, sign_msg, sign_msg_to_str, gen_kp_x448_to_str, hkdf_ikm56_to_str, unlock_with_pass } from "qwasm";
import init, { Protocol, JsNet } from "qwasm";
import './App.css';

import WorkerWrapper from './worker-wrapper';
import { setWasmInitialized } from './worker';

const worker = new WorkerWrapper();

const App = (protocol) => {
  // const [encryptResult, setEncryptResult] = useState(null);
  // const [decryptResult, setDecryptResult] = useState(null);
  // const [loading, setLoading] = useState(false);

  // const handleEncrypt = async (data) => {
  //   setLoading(true);
  //   const result = await worker.encrypt(data);
  //   setEncryptResult(result);
  //   setLoading(false);
  // };

  // const handleDecrypt = async (data) => {
  //   setLoading(true);
  //   const result = await worker.decrypt(data);
  //   setDecryptResult(result);
  //   setLoading(false);
  // };

  useEffect(() => {
    init().then(() => {
      // setWasmInitialized();
      // should throw or return an error
      async function fetch_subtree(parent_id) {
        // Serialize the array to JSON string
        const data = [1, 2, 3]
        const jsonString = JSON.stringify(data);

        // Encode the JSON string to a byte array
        const encoder = new TextEncoder();
        const byteArray = encoder.encode(jsonString);

        // Return the byte array
        return byteArray;
      }

      // should throw or return an error
      async function upload_nodes(nodes) {
        nodes.forEach(function (node) {
          const encoder = new TextDecoder();
          const ar = encoder.decode(node);
          const node_json = JSON.parse(ar);

          console.log("uploaded: " + node_json);
        });
      }

      // create a callbacks object
      const net = new JsNet(fetch_subtree, upload_nodes);
      const pass = "123";
      // instantiate a protocol
      let god = Protocol.register_as_god(pass, net);
      let protocol = god.as_protocol();

      function log_dir(dir) {
        console.log("dir: " + dir.name())
        console.log("children:")
        dir.items().forEach(function (item) {
          let ext = item.is_dir() ? "(dir)" : "." + item.ext();

          console.log(item.name() + ext);
        });
        console.log("")
      }

      function genFile() {
        const size = 100 * 1024 * 1024; // 1 MB in bytes
        const uint8Array = new Uint8Array(size);

        // Fill the array with random values
        for (let i = 0; i < size; i++) {
          uint8Array[i] = Math.floor(Math.random() * 256);
        }

        return uint8Array;
      }

      async function simulateWork() {
        try {
          log_dir(await protocol.ls_cur_mut());

          await protocol.mkdir("1");
          log_dir(await protocol.ls_cur_mut());

          let _2 = await protocol.mkdir("2");
          log_dir(await protocol.ls_cur_mut());

          console.log('cd-ing:');
          log_dir(await protocol.cd_to_dir(_2));

          console.log("cur ls:");
          log_dir(await protocol.ls_cur_mut());

          let _3 = await protocol.mkdir("3");
          log_dir(await protocol.ls_cur_mut());

          await protocol.cd_to_dir(_3);

          for (let i = 0; i < 10; i++) {
            await protocol.touch("file" + i, "png");
          }

          log_dir(await protocol.ls_cur_mut());

          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())

          log_dir(await protocol.cd_to_dir(_3));

          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())

          let file_id = await protocol.touch("encrypted", "txt");
          const file = genFile();

          let ct;
          {
            console.log("encrypting a file");

            const starttime = performance.now();

            ct = await protocol.encrypt_block_for_file(file, file_id);

            const endtime = performance.now();

            // calculate the time difference
            const timetaken = endtime - starttime;
            console.log(`time taken: ${timetaken} milliseconds; len: ` + ct.length);
            // let pt = protocol.decrypt_block_for_file(ct, file_id);
          }

          {
            console.log("decrypting a file");

            const starttime = performance.now();
            let pt = await protocol.decrypt_block_for_file(ct, file_id);
            const endtime = performance.now();

            // calculate the time difference
            const timetaken = endtime - starttime;
            console.log(`time taken: ${timetaken} milliseconds`);
            // let pt = protocol.decrypt_block_for_file(ct, file_id);
          }

          console.log("done");
          // console.log(pt);
        } catch (e) {
          console.error("Error fetching current list:", e);
        }
      }

      // Execute the function
      simulateWork();
    })
  }, [])

  return (
    <div>
      {/* <button onClick={() => handleEncrypt(new Uint8Array([1, 2, 3, 4]))}>Encrypt</button>
      <button onClick={() => handleDecrypt(new Uint8Array([6, 7, 8, 9, 10]))}>Decrypt</button>
      {loading ? <p>Loading...</p> : null}
      <p>Encrypt Result: {encryptResult}</p>
      <p>Decrypt Result: {decryptResult}</p> */}
      {/* <p>registering</p> */}
      {/* <p className="rotating-text">registering</p> */}
      <button>wow</button>
    </div>
  );
};

export default App;