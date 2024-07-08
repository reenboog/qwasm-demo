// src/worker.js
/* eslint-disable no-restricted-globals */

import init, * as wasm from 'qwasm/qwasm';

let wasmInitialized = false;

const initializeWasm = async () => {
  await init();
  wasmInitialized = true;
};

initializeWasm();

self.onmessage = async (e) => {
  if (!wasmInitialized) {
    await initializeWasm();
  }

  const { type, payload } = e.data;
  let result;

  try {
    switch (type) {
      case 'encrypt':
        // result = wasm.sign_msg_to_str(new Uint8Array([1, 2, 3]));
        result = wasm.encrypt(payload);
        break;
      case 'decrypt':
        result = wasm.decrypt(payload);
        break;
      default:
        result = 'Unknown type';
    }
  } catch (error) {
    result = `Error: ${error.message || error}`;
  } 

  self.postMessage({ type, result });
};

/* eslint-enable no-restricted-globals */