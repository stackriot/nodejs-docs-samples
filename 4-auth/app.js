'use strict';

// Activate Google Cloud Trace and Debug when in production
if (process.env.NODE_ENV === 'production') {
	require('@google-cloud/trace-agent').start();
	require('@google-cloud/debug-agent').start();
}

const path = require('path');
const express = require('express');
const session = require('express-session');
// const MongoClientConnect = require('mongo-client-connect');
// const MongoClient = require('mongodb').MongoClient
const MemcachedStore = require('connect-memcached')(session);
const passport = require('passport');
const config = require('./config');
const logging = require('./lib/logging');

const app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

// Add the request logger before anything else so that it can
// accurately log requests.
app.use(logging.requestLogger);
app.enable('trust proxy');


// Configure the session and session storage.
const sessionConfig = {
	resave: false,
	saveUninitialized: false,
	secret: config.get('SECRET'),
	signed: true
};

// In production use the App Engine Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config.get('NODE_ENV') === 'production' && config.get('MEMCACHE_URL')) {
	sessionConfig.store = new MemcachedStore({
		hosts: [config.get('MEMCACHE_URL')]
	});
}

app.use(session(sessionConfig));

// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./lib/oauth2').router);

// Books
app.use('/books', require('./books/crud'));
app.use('/api/books', require('./books/api'));

// Redirect root to /books
app.get('/', (req, res) => {
	res.redirect('/books');
});

// Our application will need to respond to health checks when running on
// Compute Engine with Managed Instance Groups.
app.get('/_ah/health', (req, res) => {
	res.status(200).send('ok');
});

// Add the error logger after all middleware and routes so that
// it can log errors from the whole application. Any custom error
// handlers should go after this.
app.use(logging.errorLogger);

// Basic 404 handler
app.use((req, res) => {
	res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res, next) => {
	/* jshint unused:false */
	// If our routes specified a specific response, then send that. Otherwise,
	// send a generic message so as not to leak anything.
	res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
	// Start the server
	const server = app.listen(config.get('PORT'), () => {
		const port = server.address().port;
		console.log(`App listening on port ${port}`);
	});
}

module.exports = app;
