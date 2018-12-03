'use strict';
const Schema = require('./schema').Schema;

const IGLU_SCHEMA_PREFIX = 'iglu:';
const IGLU_URI_PATH_PREFIX = 'schemas';

class Resolver {

  constructor (config) {
    const  resolver = this;
    this.name = config.name;
    this.vendorPrefixes = config.vendorPrefixes;
    this.priority = config.priority;
    this.cacheConfig = config.cacheConfig || {};

    if(!config.cacheConfig || !config.cacheConfig.cacheName) {
        this.cacheConfig.cacheName = ('c_' + config.name).replace(/\s/g, '_');
    }

    if (config.connection && config.connection.http) {
      this.type = 'http';
      this.uri = config.connection.http.uri;
      this.path = config.connection.http.path;
      this.retriever =  (key) => {

      };
    } else {
      // TODO: embedded?
    }
  }

  retrieve (key) {
    return this.retriever(key);
  }

  getSchemaForKey (key) { // => Promise resolving to schema object
    const resolver = this;
    return new Promise((resolve, reject) => {
      if (key.startsWith(IGLU_SCHEMA_PREFIX)) {
        return reject(Error('Key does not appear to be an iglu repository: ' + key));
      }

      const schemaFetch = resolver.retrieve(key);

      if(!schemaFetch) {
          return reject(Error('No resolver for a : ' + key));
      }

      schemaFetch.then((response) => {
        const schemaJSON = response.json();
        if(!schemaJSON) {
            return reject(Error('No schema resolved for a : ' + key));
        }

        schemaJSON.then(obj => resolve(new Schema(obj)))
                  .catch(error => reject(error));
      }).catch((error) => reject(error))
    });
  }

  resolves (schemaMetadata) { // => Boolean
    return this.vendorPrefixes.some((p) => (schemaMetadata.vendor.indexOf(p) === 0));
  }
}

module.exports = Resolver;
