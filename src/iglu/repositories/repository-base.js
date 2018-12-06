module.exports = class Repository {
    constructor(config) {
        this.config = Object.assign(config);

        this.vendorPrefixes = config
    }
    get priority () {
       return this.config.priority * 1;
    }
    vendorMatched (key) {


    }

};