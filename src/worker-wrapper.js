// src/worker-wrapper.js
export default class WorkerWrapper {
  constructor() {
    this.worker = new Worker(new URL('./worker.js', import.meta.url));
  }

  runTask(type, payload) {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        const { result } = e.data;
        resolve(result);
      };
      
      this.worker.onerror = reject;

      this.worker.postMessage({ type, payload });
    });
  }

  encrypt(data) {
    return this.runTask('encrypt', data);
  }

  decrypt(data) {
    return this.runTask('decrypt', data);
  }
}
