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

export { validateEmail, truncName, genPin };