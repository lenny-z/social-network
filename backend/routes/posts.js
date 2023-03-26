const router = require('express').Router();
const queries = require('../queries.js');

async function authorize(req, res, next) {
	console.log('authorize(req, res, next):');
	console.log(`req.session.userID: ${req.session.userID}`);

	if (req.session.userID) {
		next();
	} else {
		res.sendStatus(401); // 401 Unauthorized
	}
}

router.post('/', authorize, async (req, res) => {
	console.log('POST to /posts');

	try{
		await queries.post(req.session.userID, req.body.text);
		res.sendStatus(201); // 201 Created
	}catch(err){
		console.error(err);
		res.sendStatus(500); // 500 Internal Server Error
	}
});

module.exports = router;