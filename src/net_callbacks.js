import { JsNet } from 'qwasm';

const domain = 'localhost';
const host = `http://${domain}:5050`;

const signup = async (json) => {
	console.log("signin up");

	await fetch(`${host}/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: json
	});
};

const unlock = async (json) => {
	console.log('logging in');

	const res = await fetch(`${host}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: json
	});

	return await res.text();
}

const fetchSubtree = async () => {
	// TODO: implement
	const data = [1, 2, 3];
	const json = JSON.stringify(data);

	return json;
};

const uploadNodes = async (json) => {
	const url = `${host}/nodes`;

	const response = await fetch(`${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: json
	});

	if (!response.ok) {
		throw new Error(`Failed to upload chunk: ${response.statusText}`);
	}
};

// userId: base64-encoded string
const getMk = async (userId) => {
	const url = `${host}/users/${userId}/mk`;

	console.log("getting mk: " + userId);

	const response = await fetch(`${url}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to get mk: ${response.statusText}`);
	}

	return await response.text();
};

// userId: base64-encoded string
const getUser = async (userId) => {
	const url = `${host}/users/${userId}`;

	console.log("getting user: " + userId);

	const response = await fetch(`${url}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to get user: ${response.statusText}`);
	}

	return await response.text();
};

// email: base64-encoded string
const getInvite = async (email) => {
	const res = await fetch(`${host}/invite/pinned/${email}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		}
	});

	if (!res.ok) {
		throw new Error(`Failed to get invite: ${res.statusText}`);
	}

	return await res.text();
};

const invite = async (json) => {
	const res = await fetch(`${host}/invite/pinned`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: json
	});

	if (!res.ok) {
		throw new Error(`Failed to invite user: ${res.statusText}`);
	}
};

const startInviteIntent = async (json) => {
	const res = await fetch(`${host}/invite/intent/start`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: json
	});

	if (!res.ok) {
		throw new Error(`Failed to start an invite intent: ${res.statusText}`);
	}
};

const getInviteIntent = async (email) => {
	const res = await fetch(`${host}/invite/intent/fetch/${email}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!res.ok) {
		throw new Error(`Failed to get an invite intent: ${res.statusText}`);
	}

	return await res.text();
};

const finishInviteIntents = async (json) => {
	const res = await fetch(`${host}/invite/intent/finish/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: json
	});

	if (!res.ok) {
		throw new Error(`Failed to finish pending invite intens: ${res.statusText}`);
	}
};

// FIXME: implement share_to_pk

// tokenId: base64-encoded string
const lockSession = async (tokenId, token) => {
	const url = `${host}/sessions/lock/${tokenId}`;

	console.log("locking session: " + tokenId);

	const response = await fetch(`${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: token
	});

	if (!response.ok) {
		throw new Error(`Failed to lock session: ${response.statusText}`);
	}
};

// tokenId: base64-encoded string
const unlockSession = async (tokenId) => {
	const url = `${host}/sessions/unlock/${tokenId}`;

	console.log("unlocking session: " + tokenId);

	const response = await fetch(`${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to unlock session: ${response.statusText}`);
	}

	return await response.text();
};

// userId: base64-encoded string
const startPasskeyRegistration = async (userId) => {
	let res = await fetch(`${host}/webauthn/start-reg/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!res.ok) {
		throw new Error(`Failed to start passkey registration: ${res.statusText}`);
	}

	return await res.text();
};

// userId: base64-encoded string
const finishPasskeyRegistration = async (userId, cred) => {
	const res = await fetch(`${host}/webauthn/finish-reg/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: cred
	});

	if (!res.ok) {
		throw new Error(`Failed to finish passkey registration: ${res.statusText}`);
	}
};

const startPasskeyAuth = async () => {
	const res = await fetch(`${host}/webauthn/start-auth`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!res.ok) {
		throw new Error(`Failed to start passkey auth: ${res.statusText}`);
	}

	return await res.text();
};

// authId: base64-encoded string
const finishPasskeyAuth = async (authId, auth) => {
	const res = await fetch(`${host}/webauthn/finish-auth/${authId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: auth
	});

	if (!res.ok) {
		throw new Error(`Failed to finish passkey auth: ${res.statusText}`);
	}

	return await res.text();
};

function netCallbacks() {
	return new JsNet(signup, unlock, fetchSubtree, uploadNodes, getMk, getUser, getInvite, invite, startInviteIntent, getInviteIntent, finishInviteIntents, lockSession, unlockSession, startPasskeyRegistration, finishPasskeyRegistration, startPasskeyAuth, finishPasskeyAuth);
};

export { netCallbacks, domain, host }