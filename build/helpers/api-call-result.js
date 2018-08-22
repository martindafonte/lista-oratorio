"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiCallResult {
    constructor(error, data) {
        this.ok = error == null;
        this.error = error;
        this.data = data || null;
    }
    /**
     * Returns true if an error ocurred and logs it to console
     */
    logIfError() {
        if (!this.ok)
            console.error(this.error);
        return !this.ok;
    }
}
exports.ApiCallResult = ApiCallResult;
