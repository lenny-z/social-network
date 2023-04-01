const redis = require('redis');
const RedisStore = require('connect-redis').default;
const session = require('express-session');
const util = require('./util.js');

const redisClient = redis.createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT
	}
});

redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
	client: redisClient,
	prefix: process.env.APP_NAME
});

const sessionOptions = {
	name: process.env.APP_NAME,
	resave: false, // Enable only for session stores that don't support 'touch' command
	rolling: false, // 'Force the session identifier cookie to be set on every response' (express-session)
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	store: redisStore,

	cookie: {
		httpOnly: true,
		maxAge: 60 * 24 * 60 * 60 * 1000,
		path: '/',
		// secure: process.env.NODE_ENV === 'production'
		secure: process.env.NODE_ENV === process.env.NODE_PROD_ENV
	}
};

// module.exports = session(sessionOptions);
exports.manager = session(sessionOptions);
exports.set = (req, userID) => {
	util.log(`setSession:`);
	// var success = false;
	return new Promise((resolve, reject) => {
		req.session.regenerate((err) => {
			if (err) {
				// res.sendStatus(500); // 500 Internal Server Error
				console.error(err);
				reject(false);
				// return false;
				// success = false;
			} else {
				req.session.userID = userID;
				util.log(`\treq.session.userID: ${req.session.userID}`);

				req.session.save((err) => {
					if (err) {
						console.error(err);
						reject(false);
						// res.sendStatus(500);
						// return false;
						// success = false;
					} else {
						console.log('yay');
						resolve(true);
						// reject(false);
						// res.sendStatus(200); // 200 OK
						// return true;
						// success = true;
					}
				});
			}
		});
	});


	// return success;
}