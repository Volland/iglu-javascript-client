if (global) {
    if(!global.caches) {
        global.caches = require('fetch-cachestorage/caches');

    }
    if (!global.Request) {
        global.Request = require('node-fetch').Request;
    }
}

const IgluClient = require('./iglu-client');
module.exports.IgluClient = IgluClient;
