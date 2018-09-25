export class ApiCallResult {

    ok: boolean;
    error: any;
    data: any;

    constructor(error?: any, data?: any) {
        this.ok = error == undefined;
        this.error = error;
        this.data = data || undefined;
    }

    /**
     * Returns true if an error ocurred and logs it to console
     */
    logIfError() {
        if (!this.ok) console.error(this.error);
        return !this.ok;
    }
}