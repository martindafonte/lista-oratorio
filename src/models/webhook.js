const db = require('./database');

module.exports = class WebHook {
  constructor(api_key, token, user_id) {
    this.api_key = api_key;
    this.token = token;
    this.user_id = user_id;
    this._id = null;
  }

  saveWebHook(callback) {
    if (this._id == null) {
      db.webhooks.insert(this._getData(), (err, doc) => callback(err, doc));
    } else {
      db.webhooks.update({ _id: this._id }, { $set: this._getData() }, { returnUpdatedDocs: true },
        (err, numAffected, doc) => callback(err, doc));
    }
  }

  _getData() {
    return { api_key: this.api_key, token: this.token, user_id: this.user_id };
  }

  static findWebHook(id, callback) {
    db.webhooks.findOne({ _id: id }, (err, data) => {
      if (err) {
        callback(err);
      } else {
        let web_hook = new WebHook(data.api_key, data.token, data.user_id);
        web_hook._id = data._id;
        callback(err, web_hook);
      }
    });
  }
}