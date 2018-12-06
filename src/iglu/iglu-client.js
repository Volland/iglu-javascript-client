'use strict';

const  Resolver = require('./resolver');
const _Schema = require('./schema');
const Schema = _Schema.Schema;
const SchemaMetadata = _Schema.SchemaMetadata;

const SCHEMATIZED_FIELDS = {
  'ue': ['ue_px', 'ue_pr'], // Unstructured events base64, non-base64
  '*': ['cx', 'co']         // Contexts: base64, nonbase64
};

const IGLU_INSTANCE_ONLY_SCHEMA = 'iglu:com.snowplowanalytics.self-desc/instance-iglu-only/jsonschema/1-0-0';

class IgluClient {
  static GetSchematizedFieldNames (eventType) {
    return SCHEMATIZED_FIELDS['*'].concat(SCHEMATIZED_FIELDS[eventType] === undefined ? [] : SCHEMATIZED_FIELDS[eventType]);
  }

  constructor (config) {

    this.addAllResolversFromConfigJson(config);
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

        const objSchema = resolver.getSchemaForKey(schemaName);

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


}

module.exports = IgluClient;
