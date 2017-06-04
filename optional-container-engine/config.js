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
    .file({ file: path.join(__dirname, 'config.json') })
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

        OAUTH2_CLIENT_ID: '672255327820-8h0l5bs7aerib4rr90rf6jaf8h0c63ni.apps.googleusercontent.com',
        OAUTH2_CLIENT_SECRET: 'EbJ5RvyAyAO4Cbm6x6OJSAHB',
        OAUTH2_CALLBACK: 'https://books.npmstack.com/auth/google/callback',

        PORT: 8080,

        // Set this a secret string of your choosing
        SECRET: 'keyboardcat',

        SUBSCRIPTION_NAME: 'projects/books-470ee/subscriptions/gcr-analysis-1992cf3f33ad1e3b00679623b101a8a3',
        TOPIC_NAME: 'projects/books-470ee/topics/us.gcr.io%2Fbooks-470ee'
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