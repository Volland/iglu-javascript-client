'use strict';
const Schema = require('./schema').Schema;

const IGLU_SCHEMA_PREFIX = 'iglu:';

class Resolver {

  constructor (config) {
    this.name = config.name;
    this.vendorPrefixes = config.vendorPrefixes;
    this.priority = config.priority;



    if (config.connection && config.connection.http) {
      this.uri = config.connection.http.uri;
      this.path = config.connection.http.path;
      this.retriever =  (key) => {

      };
    } else {
      // TODO: embedded?
    }
  }

  clearResolvers () {
    this.resolvers = [];
  }
  addAllResolversFromConfigJson (json) {
    let config;
    if (typeof json === undefined) {
      return;
    }

    if (typeof json === 'string') {
      config = JSON.parse(json);
    } else {
      config = Object.assign({}, json);
    }

    if(config.data && config.schema) {
      // TODO : validate
      config = config.data;
    }

    this.resolvers = config.repositories.map(c => new Resolver(c));


    this.prioritizeResolvers();
  }

  prioritizeResolvers () {
    this.resolvers.sort((a, b) => ((b.priority || -1) - (a.priority || -1)));
  }

  validateObjectAgainstSchema (obj, schema) {
    let s = new Schema(schema);
    return s.validate(obj);
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
    return this.vendorPrefixes.some((p) => (schemaMetadata.vendor.indexOf(p) !== -1));
  }
}

module.exports = Resolver;
