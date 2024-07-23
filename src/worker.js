// src/worker.js
/* eslint-disable no-restricted-globals */

// import init, { Protocol } from "qwasm";

// let wasmInitialized = false;

// function setWasmInitialized() {
//   wasmInitialized = true;
// }

// const initializeWasm = async () => {
//   await init();
//   wasmInitialized = true;
// };

// initializeWasm();

// self.onmessage = async (e) => {
//   if (!wasmInitialized) {
//     await initializeWasm();
//   }

//   const { type, payload } = e.data;
//   let result;

//   try {
//     switch (type) {
//       case 'encrypt_block_for_file':
//         // wont' work, since protocol would be to instantiate/deserialize here instead
//         result = payload.protocol.encrypt_block_for_file(payload.data, payload.fileId);
//         break;
//       case 'decrypt_block_for_file':
//         result = payload.protocol.decrypt_block_for_file(payload.data, payload.fileId);
//         break;
//       default:
//         result = 'Unknown type';
//     }
//   } catch (error) {
//     result = `Error: ${error.message || error}`;
//   } 

//   self.postMessage({ type, result });
// };

// export { setWasmInitialized };

/* eslint-enable no-restricted-globals */