module.exports = class ApiCallResult {
    constructor(error, data = null) {
        this.ok = error == null;
        this.error = error;
        this.data = data;
    }

    /**
     * Returns true if an error ocurred and logs it to console
     */
    logIfError() {
        if (!this.ok) console.error(this.error);
        return !this.ok;
    }


}