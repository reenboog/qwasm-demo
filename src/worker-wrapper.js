// src/worker-wrapper.js
// export default class WorkerWrapper {
//   constructor() {
//     this.worker = new Worker(new URL('./worker.js', import.meta.url));
//   }

//   runTask(type, payload) {
//     return new Promise((resolve, reject) => {
//       this.worker.onmessage = (e) => {
//         const { result } = e.data;
//         resolve(result);
//       };
      
//       this.worker.onerror = reject;

//       this.worker.postMessage({ type, payload });
//     });
//   }

//   // encrypt_block_for_file(protocol, fileId, data) {
//   //   return this.runTask('encrypt_block_for_file', { protocol, fileId, data });
//   // }

//   // decrypt_block_for_file(protocol, fileId, data) {
//   //   return this.runTask('decrypt_block_for_file', { protocol, fileId, data });
//   // }
// }
