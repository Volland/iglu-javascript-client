ServiceWorkerCachingRetriever (cacheName, baseURI, key) {
    const keyWithoutIgluPrefix = key.substring(IGLU_SCHEMA_PREFIX.length);
    const url = [baseURI, IGLU_URI_PATH_PREFIX, keyWithoutIgluPrefix].join('/');

    const request = new Request(url, {
        method: 'GET',
        mode: 'cors'
    });

    return caches.open(cacheName).then(function (cache) {
        // console.log('Fetching schema from: ', url);
        let add = cache.add(request).then(function () {
            let match = cache.match(request); // *Should* always have a match unless somehow the cache is cleared since the last line...
            return match;
        });
        return add;
    });
}