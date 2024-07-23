import React, { useEffect, useState } from 'react';
import init, { Protocol, JsNet } from "qwasm";

const App = (protocol) => {
  useEffect(() => {
    init().then(() => {
      // returns an utf-8 encoded array of locked nodes
      async function fetch_subtree(parent_id) {
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
      }

      // should throw or return an error
      // accepts an array of utf-8 encoded json objects (NOT STRINGS)
      async function upload_nodes(nodes) {
        nodes.forEach(function (node) {
          const encoder = new TextDecoder();
          const ar = encoder.decode(node);
          const node_json = JSON.parse(ar);

          console.log("uploaded: " + node_json);
        });
      }

      let god_json;
      const pass = "123";
      {
        // create a callbacks object
        // this will be consumed by register_as_god, hence we're in an isolated scope here
        const net = new JsNet(fetch_subtree, upload_nodes);
        // instantiate a protocol
        let god = Protocol.register_as_god(pass, net);
        god_json = god.json();
      }

      const net = new JsNet(fetch_subtree, upload_nodes);
      let protocol = Protocol.unlock_with_pass(pass, god_json, net);
      // let protocol = god.as_protocol();

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
        const size = 1 * 1024 * 1024; // 1 MB in bytes
        const buf = new Uint8Array(size);

        // TODO: SharedArrayBuffer could be used to avoid copying, but it might require
        // some server headers to be change for support

        // redAFill the array with random values
        for (let i = 0; i < size; i++) {
          buf[i] = Math.floor(Math.random() * 256);
        }

        return buf;
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
      <button>wow</button>
    </div>
  );
};

export default App;