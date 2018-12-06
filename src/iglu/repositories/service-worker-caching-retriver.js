if (global) {
    if(!global.caches) {
        global.caches = require('fetch-cachestorage/caches');

    }
    if (!global.Request) {
        global.Request = require('node-fetch').Request;
    }
}

if(!config.cacheConfig || !config.cacheConfig.cacheName) {
    this.cacheConfig.cacheName = ('c_' + config.name).replace(/\s/g, '_');
}

ServiceWorkerCachingRetriever (cacheName, baseURI, key) {

    const keyWithoutIgluPrefix = key.substring(IGLU_SCHEMA_PREFIX.length);
    const url = [baseURI, IGLU_URI_PATH_PREFIX, keyWithoutIgluPrefix].join('/');

    const request = new Request(url, {
        method: 'GET',
        mode: 'cors'
    });

    return caches.open(cacheName).then(function (cache) {
        let add = cache.add(request).then(function () {
            let match = cache.match(request); // *Should* always have a match unless somehow the cache is cleared since the last line...
            return match;
        });
        return add;
    });
}