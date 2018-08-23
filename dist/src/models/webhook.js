"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("./database");
const base_model_1 = require("./base-model");
class WebHook extends base_model_1.BaseModel {
    /**
   * Constructor of class WebHook
   * @param {string} api_key
   * @param {string} token
   * @param {string} user_id
   */
    constructor(api_key, token, user_id) {
        super();
        this.api_key = api_key;
        this.token = token;
        this.user_id = user_id;
        this._id = null;
    }
    saveWebHook(callback) {
        this.saveOrUpdate(db.webhooks, callback);
    }
    _getData() {
        return { api_key: this.api_key, token: this.token, user_id: this.user_id };
    }
    static findWebHook(id, callback) {
        db.webhooks.findOne({ _id: id }, (err, data) => {
            if (err || data == null) {
                callback(err || `Webhook ${id} couldn't be found`);
            }
            else {
                let web_hook = new WebHook(data.api_key, data.token, data.user_id);
                web_hook._id = data._id;
                callback(err, web_hook);
            }
        });
    }
}
exports.WebHook = WebHook;
//# sourceMappingURL=webhook.js.map