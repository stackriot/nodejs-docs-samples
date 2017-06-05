// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');

nconf
	// 1. Command-line arguments
	.argv()
	// 2. Environment variables
	.env([
    'CLOUD_BUCKET',
    'DATA_BACKEND',
    'GCLOUD_PROJECT',
    'MEMCACHE_URL',
    'MONGO_URL',
    'MONGO_COLLECTION',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'NODE_ENV',
    'OAUTH2_CLIENT_ID',
    'OAUTH2_CLIENT_SECRET',
    'OAUTH2_CALLBACK',
    'PORT',
    'SECRET',
    'SUBSCRIPTION_NAME',
    'TOPIC_NAME'
  ])
	// 3. Config file
	.file({
		file: path.join(__dirname, 'config.json')
	})
	// 4. Defaults
	.defaults({
		// Typically you will create a bucket with the same name as your project ID.
		CLOUD_BUCKET: 'books-470ee.appspot.com',

		// dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
		// configure the appropriate settings for each storage engine below.
		// If you are unsure, use datastore as it requires no additional
		// configuration.
		DATA_BACKEND: 'mongodb',

		// This is the id of your project in the Google Cloud Developers Console.
		GCLOUD_PROJECT: 'node-mongodb',

		// Connection url for the Memcache instance used to store session data
		MEMCACHE_URL: 'localhost:11211',

		// MongoDB connection string
		// https://docs.mongodb.org/manual/reference/connection-string/
		MONGO_URL: 'mongodb://dori:app123321@ds163301.mlab.com:63301/gcloud-node-mongo',
		MONGO_COLLECTION: 'books',
		MYSQL_USER: '',
		MYSQL_PASSWORD: '',

		OAUTH2_CLIENT_ID: '476481807572-dcaqb6tsg0fo10a6526i0hgfdmdlfa2t.apps.googleusercontent.com',
		OAUTH2_CLIENT_SECRET: '5KKZ7olxzrZb8KidX9-w1aJh',
		OAUTH2_CALLBACK: 'https://node-mongodb.appspot.com/auth/google/callback',

		PORT: 8080,

		// Set this a secret string of your choosing
		SECRET: 'keyboardcat',

		SUBSCRIPTION_NAME: 'projects/node-mongodb/subscriptions/gcr-analysis-0d1c54a28877aaf6658391cfa8c33746',
		TOPIC_NAME: 'projects/node-mongodb/topics/us.gcr.io%2Fnode-mongodb'
	});

// Check for required settings
checkConfig('GCLOUD_PROJECT');
checkConfig('CLOUD_BUCKET');
checkConfig('OAUTH2_CLIENT_ID');
checkConfig('OAUTH2_CLIENT_SECRET');

if (nconf.get('DATA_BACKEND') === 'cloudsql') {
	checkConfig('MYSQL_USER');
	checkConfig('MYSQL_PASSWORD');
	if (nconf.get('NODE_ENV') === 'production') {
		checkConfig('INSTANCE_CONNECTION_NAME');
	}
} else if (nconf.get('DATA_BACKEND') === 'mongodb') {
	checkConfig('MONGO_URL');
	checkConfig('MONGO_COLLECTION');
}

function checkConfig(setting) {
	if (!nconf.get(setting)) {
		throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
	}
}
