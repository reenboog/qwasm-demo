import React, { useEffect, useState } from 'react';
// import init, { User, register_as_god, add, mul, sub, pow2, sign_msg, sign_msg_to_str, gen_kp_x448_to_str, hkdf_ikm56_to_str, unlock_with_pass } from "qwasm";
import init, { User, register_as_god, unlock_with_pass } from "qwasm";
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


const App = () => {
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
      console.log("initialized");
      const god = register_as_god("god-pass");

      console.log(god.json());

      const exported = god.user().export_seeds_encrypted("pin", "email");

      console.log(exported);

      console.log('deserializing json');
      // const jsonObject = deserialize(god.json());
      const jsonString = new TextDecoder("utf-8").decode(god.json());
      const jsonObject = JSON.parse(jsonString);

      // Display the object
      console.log(jsonObject);

      try {
        const unlocked = unlock_with_pass("god-pass", god.json());

        console.log("unlocked ");

        for(let i = 0; i < 10; i++) {
          let ct = god.user().encrypt_announcement("god to admin: " + i);
          let pt = unlocked.decrypt_announcement(ct);

          console.log(pt);

          ct = unlocked.encrypt_announcement("admin to god: " + i);
          pt = god.user().decrypt_announcement(ct);

          console.log(pt);
        }
      } catch (e) {
        console.log("error!");
        console.log(e);
      }
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