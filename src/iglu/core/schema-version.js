const schemaVerFullRegex = /^([1-9][0-9]*)-(0|[1-9][0-9]*)-(0|[1-9][0-9]*)$/;
const schemaVerPartialRegex = /^([1-9][0-9]*|\\?)-((?:0|[1-9][0-9]*)|\\?)-((?:0|[1-9][0-9]*)|\\?)$/;
const separator =  "-";
const notDefinedString = "*";
const toNullablePositiveInt = x => {
    const val = parseInt(x,10);
    return !Number.isNaN(val) && (val >= 0)? val : null;
    };

const comparable = x => x === null ? -1 : x;

export.module = class SchemaVersion {
    /**
     * Regular expression to validate or extract `Partial` SchemaVer,
     * with possible unknown MODEL, REVISION, ADDITION
     */

    static parse(string) {
        const versions = (string || "").split(separator);
        return schemaVerPartialRegex.test(string) ? new SchemaVersion(versions[0], versions[1], versions[2]) : null;
    }

    static parseFull(string) {
        const versions = (string || "").split(separator);
        return schemaVerFullRegex.test(string) ? new SchemaVersion(versions[0], versions[1], versions[2]) : null;
    }
    static isValid(string) {
        return schemaVerFullRegex.test(string);
    }

    constructor(model, revision, addition) {
        this.model = toNullablePositiveInt(model);
        if (this.model !== null && this.model < 1) {
            throw Error("Incorrect model")
        }
        this.revision = toNullablePositiveInt(revision);
        this.addition = toNullablePositiveInt(addition);
        this.isFull = this.model !== null && this.revision !== null && this.revision !== null;

    }

    toString () {
        return `${this.model || notDefinedString}${separator}${this.revision || notDefinedString}${separator}${this.addition || notDefinedString}`;
    }
    compare (version) {
        if (!version) {
            return 1;
        }
        if (comparable(this.model) - comparable(version.model) === 0) {
            if(comparable(this.revision) - comparable(version.revision) === 0 ) {
                return comparable(this.addition) - comparable(version.addition);
            }
            return comparable(this.revision) - comparable(version.revision);
        }
        return comparable(this.model) - comparable(version.model);
    }
};
