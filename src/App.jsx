import React, { useEffect, useState } from 'react';
// import init, { User, register_as_god, add, mul, sub, pow2, sign_msg, sign_msg_to_str, gen_kp_x448_to_str, hkdf_ikm56_to_str, unlock_with_pass } from "qwasm";
import init, { Protocol, JsNet } from "qwasm";
import './App.css';


// import WorkerWrapper from './worker-wrapper';

// const worker = new WorkerWrapper();

// function App() {
//   const [ans, setAns] = useState(0);
//   const [sig, setSig] = useState("");
//   const [x448, setX448] = useState("");
//   const [ikm, setIkm] = useState("");
//   // const [encryptedData, setEncryptedData] = useState("Encrypting...");
//   // const [decryptedData, setDecryptedData] = useState("Decrypting...");

//   useEffect(() => {
//     init().then(() => {
//       setAns(pow2(10));
//       setSig(sign_msg_to_str(new Uint8Array([1, 2, 3])));
//       setX448(gen_kp_x448_to_str());
//       setIkm(hkdf_ikm56_to_str(new Uint8Array([1, 2, 3, 4, 5])));

//       // const worker = new Worker(new URL('./qasync_worker.js', import.meta.url), { type: 'module' });

//       // worker.onmessage = (e) => {
//       //   const { cmd, result } = e.data;
//       //   if (cmd === 'encrypt') {
//       //     setEncryptedData(result);
//       //   } else if (cmd === 'decrypt') {
//       //     // setDecryptedData(result);
//       //   }
//       // };

//       // // Example payload
//       // worker.postMessage({ cmd: 'encrypt', payload: new Uint8Array([2, 3, 4, 5, 6]) });
//       // worker.postMessage({ cmd: 'decrypt', payload: 'Encrypted data to decrypt' });

//       // return () => worker.terminate();  // Clean up the worker when component unmounts
//     })
//   }, [])
//   return (
//     <div className="App">
//       <header className="App-header">
//         <p>2 ^ 10 = {ans}</p>
//         <p>sig = {sig}</p>
//         <p>x448 = {x448}</p>
//         <p>ikm = {ikm}</p>
//         {/* <p>Encrypted data: {encryptedData}</p> */}
//         {/* <p>Decrypted data: {decryptedData}</p> */}
//       </header>
//     </div>
//   );
// }


const App = (protocol) => {
  // const [encryptResult, setEncryptResult] = useState(null);
  // const [decryptResult, setDecryptResult] = useState(null);
  // const [loading, setLoading] = useState(false);

  // FIXME: use this for encryptions
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
      nodes.forEach(function(node) {
        const encoder = new TextDecoder();
        const ar = encoder.decode(node);
        const node_json = JSON.parse(ar);

        console.log(node_json);
      });
     }

     const net = new JsNet(fetch_subtree, upload_nodes);
     const pass = "123";
     let god = Protocol.register_as_god(pass, net);

     console.log("Registered as God:", god.json());

     let protocol = god.as_protocol();

     function log_dir(dir) {
      console.log("dir: " + dir.name())
      console.log("children:")
      dir.items().forEach(function(item) {
        let ext = item.is_dir() ? "(dir)" : "." + item.ext();
        
        console.log(item.name() + ext);
      });
      console.log("")
     }
     
     async function fetchCurrentList() {
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

          for(let i = 0; i < 10; i++) {
            await protocol.touch("file" + i, "png", new Uint8Array());
          }

          log_dir(await protocol.ls_cur_mut());

          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
          
          log_dir(await protocol.cd_to_dir(_3));

          log_dir(await protocol.go_back())
          log_dir(await protocol.go_back())
      } catch (e) {
          console.error("Error fetching current list:", e);
      }
  }
  
  // Execute the function
  fetchCurrentList();
      // function get_subtree(id) {
      //   let nodes = await graphql_api.send();

      //   return nodes
      // }

      // function upload_nodes(locked_nodes) {
      //   //
      // }

      // let network_callbacks = Network(get_subtree, fetch_user_acl, ...);
      // let protocol = Protocol::new_for_unlock(pas, json, network_callbacks);

      // let dir = await protocol.ls_cur_mut();

      // {
      //   <p>dir.name()</p>
      //   <p>di.rlast_changed</p>
      // }



      // console.log("initialized");
      // const god = register_as_god("god-pass");

      // console.log(god.json());

      // const exported = god.user().export_seeds_encrypted("pin", "email");

      // console.log(exported);

      // console.log('deserializing json');
      // // const jsonObject = deserialize(god.json());
      // const jsonString = new TextDecoder("utf-8").decode(god.json());
      // const jsonObject = JSON.parse(jsonString);

      // // Display the object
      // console.log(jsonObject);

      // try {
      //   const unlocked = unlock_with_pass("god-pass", god.json());

      //   console.log("unlocked ");

      //   for(let i = 0; i < 10; i++) {
      //     let ct = god.user().encrypt_announcement("god to admin: " + i);
      //     let pt = unlocked.decrypt_announcement(ct);

      //     console.log(pt);

      //     ct = unlocked.encrypt_announcement("admin to god: " + i);
      //     pt = god.user().decrypt_announcement(ct);

      //     console.log(pt);
      //   }
      // } catch (e) {
      //   console.log("error!");
      //   console.log(e);
      // }
    })
  }, [])

  return (
    <div>
      {/* <button onClick={() => handleEncrypt(new Uint8Array([1, 2, 3, 4]))}>Encrypt</button>
      <button onClick={() => handleDecrypt(new Uint8Array([6, 7, 8, 9, 10]))}>Decrypt</button>
      {loading ? <p>Loading...</p> : null}
      <p>Encrypt Result: {encryptResult}</p>
      <p>Decrypt Result: {decryptResult}</p> */}
      <p>registering</p>
    </div>
  );
};

export default App;