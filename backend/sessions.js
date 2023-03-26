const redis = require('redis');
const RedisStore = require('connect-redis').default;
const session = require('express-session');
// const crypto = require('crypto');

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

// const sessionSecret = crypto.randomBytes(256).toString('hex');
// console.log(sessionSecret);

const sessionOptions = {
	name: process.env.APP_NAME,
	resave: false, // Enable only for session stores that don't support 'touch' command
	rolling: false, // 'Force the session identifier cookie to be set on every response' (express-session)
	saveUninitialized: true,
	// secret: sessionSecret,
	secret: process.env.SESSION_SECRET,
	store: redisStore,

	cookie: {
		httpOnly: true,
		maxAge: 60 * 24 * 60 * 60 * 1000,
		secure: false, // Set to true once HTTPS enabled
	}
};

// module.exports = () => {
	// return session(sessionOptions);
// }

exports.manager = session(sessionOptions);
exports.store = redisStore;