const db = require('./database');
module.exports = class User {
  /**
   * Constructor of class User
   * @param {string} username 
   * @param {string} api_key 
   * @param {string} token 
   */
  constructor(username, api_key, token) {
    this.username = username;
    this.api_key = api_key;
    this.token = token;
    this._id = null;
  }

  saveUser(callback) {
    if (this._id == null) {
      db.users.insert(this._getData(), (err, doc) => callback(err, doc));
    } else {
      db.users.update({ _id: this._id }, { $set: this._getData() }, { returnUpdatedDocs: true },
        (err, numAffected, doc) => callback(err, doc));
    }
  }

  _getData() {
    return { username: this.username, api_key: this.api_key, token: this.token };
  }

  static findUser(id, callback) {
    db.users.findOne({ _id: id }, (err, data) => {
      if (err) {
        callback(err);
      } else {
        let user = new User(data.username, data.api_key, data.token);
        user._id = data._id;
        callback(err, user);
      }
    });
  }
}