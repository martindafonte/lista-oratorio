"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiCallResult {
    constructor(error, data) {
        this.ok = error == undefined;
        this.error = error;
        this.data = data || undefined;
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
//# sourceMappingURL=api-call-result.js.map