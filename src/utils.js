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

const genThumb = async (file) => {
	const imageBitmap = await createImageBitmap(file, { resizeWidth: 24, resizeHeight: 24 });
	const canvas = document.createElement('canvas');
	canvas.width = 24;
	canvas.height = 24;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(imageBitmap, 0, 0, 24, 24);
	return canvas.toDataURL('image/png');
};

export { validateEmail, truncName, genPin, genThumb };