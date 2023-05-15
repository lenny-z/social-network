const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const usernameCharsRegex = /^[a-zA-Z0-9_-]*$/;

exports.allReqsMet = (reqs) => {
	const keys = Object.keys(reqs);

	for (const req of keys) {
		if (reqs[req].value !== true) {
			return false;
		}
	}

	return true;
};

//Requirements met and not met
// exports.reqsMet = (reqs) => {
// 	const keys = Object.keys(reqs);
// 	const met = [];
// 	const notMet = [];

// 	for (const req of keys) {
// 		if (reqs[req] === true) {
// 			met.push(req);
// 		} else {
// 			notMet.push(req);
// 		}
// 	}

// 	return {
// 		met: met,
// 		notMet: notMet
// 	}
// };

exports.reqsNotMet = (validation) => {
	const reqs = Object.keys(validation);
	const reqsNotMet = [];

	for (const req of reqs) {
		if (!reqs[req].value) {
			reqsNotMet.push(reqs[req].description)
		}
	}

	return reqsNotMet;
}

exports.email = (email) => {
	// const reqs = {
	// 	isValid: emailRegex.test(email)
	// }
	const reqs = {
		isValid: {
			description: 'Email must be valid.',
			value: emailRegex.test(email)
		}
	};

	return reqs;
};

exports.username = (username) => {
	const protectedNames = [
		'login',
		'register',
		'search',
		'settings'
	];

	// const reqs = {
	// 	isString: false,
	// 	notProtected: false,
	// 	lengthAtLeast1: false,
	// 	lengthAtMost32: false,
	// 	allowedCharsOnly: false
	// };
	const reqs = {
		isString: {
			description: 'Must be valid sequence of characters.',
			value: false
		},
		notProtected: {
			description: 'Must not be a restricted term.',
			value: false
		},
		lengthAtLeast1: {
			description: 'Must be at least one character long.',
			value: false
		},
		lengthAtMost32: {
			description: 'Must be at most 32 characters long.',
			value: false
		},
		allowedCharsOnly: {
			description: 'Must contain only alphanumerics, underscores, and hyphens.',
			value: false
		}
	}

	if (typeof username === 'string') {
		reqs.isString.value = true;
	} else {
		return reqs;
	}

	if (protectedNames.includes(username.toLowerCase()) === false) {
		reqs.notProtected.value = true;
	}

	if (username.length >= 1) {
		reqs.lengthAtLeast1.value = true;
	}

	if (username.length <= 32) {
		reqs.lengthAtMost32.value = true;
	}

	if (usernameCharsRegex.test(username) === true) {
		reqs.allowedCharsOnly = true;
	}

	return reqs;
};

exports.password = (password, retypedPassword) => {
	const reqs = {
		isString: {
			description: 'Must be valid sequence of characters.',
			value: false
		},
		isMatch: {
			description: 'Retyped password must match password.',
			value: false
		},
		lengthAtLeast14: {
			description: 'Must be at least 14 characters long.',
			value: false
		},
		lengthAtMost128: {
			description: 'Must be at most 128 characters long.',
			value: false
		}
	};

	if (typeof password === 'string') {
		reqs.isString.value = true;
	} else {
		return reqs;
	}

	if (password === retypedPassword) {
		reqs.isMatch.value = true;
	}

	if (password.length >= 14) {
		reqs.lengthAtLeast14.value = true;
	}

	if (password.length <= 128) {
		reqs.lengthAtMost128.value = true;
	}

	return reqs;
}