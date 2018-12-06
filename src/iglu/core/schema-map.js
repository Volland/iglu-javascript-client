/** Canonical regular expression for SchemaKey/SchemaMap */
const SchemaKey = require('./schema-key');

const schemaUriRegex = new RegExp(
    "^iglu:" +                          // Protocol
    "([a-zA-Z0-9-_.]+)/" +            // Vendor
    "([a-zA-Z0-9-_]+)/" +             // Name
    "([a-zA-Z0-9-_]+)/" +             // Format
    "([1-9][0-9]*" +                  // MODEL (cannot start with 0)
    "(?:-(?:0|[1-9][0-9]*)){2})$"); // REVISION and ADDITION

/** Regular expression to extract SchemaKey from path */
const schemaPathRegex = new RegExp(
    "^([a-zA-Z0-9-_.]+)/" +
    "([a-zA-Z0-9-_]+)/" +
    "([a-zA-Z0-9-_]+)/" +
    "([1-9][0-9]*" +
    "(?:-(?:0|[1-9][0-9]*)){2})$");

module.exports  = class SchemaMap {
    static fromUri(string) {
        const result = schemaUriRegex.exec(string);
        if(!result) {
            return null;
        }
        const [_ , vendor, name, format , version] = result;
        return new SchemaMap(vendor, name, format, SchemaVersion.parseFull(version))
    }

    static fromPath(string) {
        const result = schemaPathRegex.exec(string);
        if(!result) {
            return null;
        }

        const [vendor, name, format , version] = result;
        return new SchemaMap(vendor, name, format, SchemaVersion.parseFull(version))
    }

    constructor(vendor, name, format, version) {
        this.vendor = vendor;
        this.name = name;
        this.format = format;
        this.version = new SchemaVersion(version.model, version.revision, version.addition);
    }

    compare (key) {
        if(key) {
            return 1;
        }

        const curPart = `${this.vendor}/${this.name}/${this.format}`;
        const keyPart = `${key.vendor}/${key.name}/${key.format}`;

        if(curPart === keyPart) {
            return  this.version.compare(key.version)
        }

        return curPart > keyPart;
    }
    get asSchemaUri () {
        return `iglu:${this.vendor}/${this.name}/${this.format}/${version}`;
    }
    get asPath () {
        return `{this.vendor}/${this.name}/${this.format}/${version}`;
    }
    get asKey () {
        return new SchemaKey(this.vendor, this.name, this.format, this.version);
    }
};
