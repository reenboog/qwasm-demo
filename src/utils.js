
function validateEmail(email) {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	return emailRegex.test(email);
}

const truncName = (name, maxLength = 60) => {
	if (!name) return null;
	return name.length > maxLength
		? name.length > 3
			? name.substring(0, maxLength - 3) + '...'
			: name.slice(0, maxLength)
		: name;
};

function genPin(length = 4) {
	return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

const genThumb = (file) => {
	return new Promise((resolve, reject) => {
		// if used often, should be preserved for reuse
		const worker = new Worker(new URL('./worker.js', import.meta.url));
		const handleWorkerMessage = function (event) {
			if (event.data.type === 'thumb_ready') {
				resolve(URL.createObjectURL(event.data.payload));
				worker.removeEventListener('message', handleWorkerMessage); // Clean up event listener
			}
		};

		worker.addEventListener('message', handleWorkerMessage);
		worker.onerror = function (error) {
			reject(error);
		};

		worker.postMessage({ type: 'gen_thumb', payload: file });
	});
};

export { validateEmail, truncName, genPin, genThumb };