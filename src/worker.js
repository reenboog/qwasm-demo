
// src/worker.js
/* eslint-disable no-restricted-globals */

self.onmessage = async function (event) {
	const { type, payload } = event.data;

	switch (type) {
		case 'gen_thumb':
			const file = payload;
			const imageBitmap = await createImageBitmap(file, { resizeWidth: 24, resizeHeight: 24 });
			const canvas = new OffscreenCanvas(24, 24);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(imageBitmap, 0, 0, 24, 24);
			const thumbnail = await canvas.convertToBlob({ type: 'image/png' });
			self.postMessage({ type: 'thumb_ready', payload: thumbnail });
			break;
		default:
			console.error('Unknown message type:', type);
	}
};

/* eslint-enable no-restricted-globals */