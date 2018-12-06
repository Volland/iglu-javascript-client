const toNullablePositiveInt = x => {
    const val = parseInt(x,10);
    return !Number.isNaN(val) && (val >= 0)? val : null;
};

const criterionRegex = new RegExp(
    "^iglu:" +              // Protocol
    "([a-zA-Z0-9-_.]+)/" +          // Vendor
    "([a-zA-Z0-9-_]+)/" +           // Name
    "([a-zA-Z0-9-_]+)/" +           // Format
    "([1-9][0-9]*|\\*)-" +          // MODEL (cannot start with zero)
    "((?:0|[1-9][0-9]*)|\\*)-" +    // REVISION
    "((?:0|[1-9][0-9]*)|\\*)$");    // ADDITION

module.exports = class SchemaCriterion {
    static parse(string) {
        const result = criterionRegex.exec(string);
        if(!result) {
            return null;
        }
        const [_ , vendor, name, format , model, revision, addition] = result;
        return new SchemaCriterion(vendor, name, format,  model, revision, addition);
    }

    constructor(vendor, name, format, model, revision, addition) {
        this.vendor = "" + vendor;
        this.name = "" + name;
        this.format = "" + format;
        this.model = toNullablePositiveInt(model);
        this.revision = toNullablePositiveInt(revision);
        this.addition = toNullablePositiveInt(addition);
    }

    matches (key) {
        if(!key) {
            return false;
        }
        const curPart = `${this.vendor}${this.name}${this.format}`;
        const keyPart = `${key.vendor}${key.name}${key.format}`;
        if(curPart === keyPart) {
            return (this.mode === null ||  (this.mode !== null && (this.model === key.model))) &&
                (this.revision === null || (this.revision !== null && (this.revision === key.revision))) &&
                (this.addition === null || (this.addition !== null && this.addition === key.addition))
        }
        return false;
    }
};
