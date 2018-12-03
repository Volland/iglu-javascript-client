'use strict';

let Resolver = require('./resolver');
let _Schema = require('./schema');
let Schema = _Schema.Schema;
let SchemaMetadata = _Schema.SchemaMetadata;

const SCHEMATIZED_FIELDS = {
  'ue': ['ue_px', 'ue_pr'], // Unstructured events base64, non-base64
  '*': ['cx', 'co']         // Contexts: base64, nonbase64
};

const IGLU_INSTANCE_ONLY_SCHEMA = 'iglu:com.snowplowanalytics.self-desc/instance-iglu-only/jsonschema/1-0-0';

class IgluClient {
  static GetSchematizedFieldNames (eventType) {
    return SCHEMATIZED_FIELDS['*'].concat(SCHEMATIZED_FIELDS[eventType] === undefined ? [] : SCHEMATIZED_FIELDS[eventType]);
  }

  constructor (config , Resolver ) {
    this.clearResolvers();
    this.addAllResolversFromConfigJson(config);
    this.prioritizeResolvers();
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

    if(config.data && config.shema) {
        config = config.data;
    }

    const resolverConfigs = config.repositories || Array.isArray(config) ? config : [];
    this.resolvers = resolverConfigs.map(c => new Resolver(c));


    this.prioritizeResolvers();
  }

  prioritizeResolvers () {
    this.resolvers.sort((a, b) => ((b.priority || -1) - (a.priority || -1)));
  }

  validateObject (obj) {
    const iglu = this;
    return new Promise((resolve, reject) => {
      const instanceOnlySchema = this.getSchemaForKey(IGLU_INSTANCE_ONLY_SCHEMA);

      instanceOnlySchema.then(
         (schema) => {
          const instanceOnlyResult = schema.validate(obj);
          if (!instanceOnlyResult.isValid) {
            instanceOnlyResult.stack = (new Error()).stack;
            return reject(instanceOnlyResult);
          }
        },
        reject
      ).then(() => {
        const schemaName = obj.schema;
        const dataObj = obj.data;

        if (schemaName) {
          return reject({object: obj, error: 'NoSchemaError', message: 'Could not find schema in object.', stack: (new Error()).stack});
        }

        const objSchema = iglu.getSchemaForKey(schemaName);

        objSchema.catch(reject);

        objSchema.then((schema) => {
          const validationResult = schema.validate(dataObj);
          if (!validationResult.isValid) {
            return reject(validationResult);
          }
          const dataValidations = [];

          if (Array.isArray(dataObj)) {
            dataValidations.concat(dataObj.map((item) => iglu.validateObject(item)));
          }
          if (dataObj.schema) {
            dataValidations.push(iglu.validateObject(dataObj));
          }
            return Promise.all(dataValidations).then(() => resolve(validationResult), reject);
          });
      });
    });
  }

  validateObjectAgainstSchema (obj, schema) {
    let s = new Schema(schema);
    return s.validate(obj);
  }

  getSchemaForKey (key) {
    const myResolvers = this.resolvers;
    return new Promise(function (resolve, reject) {
        const schemaMetadata = SchemaMetadata.FromSchemaKey(key);
        let resolver;

        for (let i = 0,len = myResolvers.length; i < len; i++) {
          if (myResolvers[i].resolves(schemaMetadata)) {
            resolver = myResolvers[i];
            break;
          }
        }

        if (resolver) {
          const schema = resolver.getSchemaForKey(key);
          if(schema) {
              schema.then(resolve, reject);
          }
          return reject(Error ('No schema by key'));
        } else {
          console.log('Could not find resolver for key: ', key, myResolvers);
          reject(Error('No resolver found for: ' + key));
        }

    });
  }
}

module.exports = IgluClient;
