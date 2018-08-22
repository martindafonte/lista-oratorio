import db = require('./database');
import {BaseModel} from './base-model';
export class User extends BaseModel {

  username: string;
  api_key: string;
  token: string;
  boards_array: any[];

  /**
   * Constructor of class User
   * @param {string} username 
   * @param {string} api_key 
   * @param {string} token 
   */
  constructor(username: string, api_key: string, token: string) {
    super();
    this.username = username;
    this.api_key = api_key;
    this.token = token;
    this._id = null;
    this.boards_array = null;
  }

  saveUser(callback) {
    this.saveOrUpdate(db.users, callback);
  }

  getConfiguredBoards(callback) {
    try {
      if (this.boards_array != null) {
        callback(null, this.boards_array)
      } else {
        let query = this._id != null ? { _id: this._id } : { username: this.username };
        db.users.findOne(query, (err, data: User) => {
          if (err) {
            callback(err, null); return;
          }
          this.boards_array = data.boards_array;
          callback(err, this.boards_array);
        });
      }
    }
    catch (err) {
      callback(err, null);
    }
  }

  setConfiguredBoard(board) {
    if (!this.boards_array)
      this.boards_array = [];
    this.boards_array.push(board);
  }

  _getData() {
    let data = { username: this.username, api_key: this.api_key, token: this.token, boards_array: null };
    if (this.boards_array)
      data.boards_array = this.boards_array;
    return data;
  }

  static findUser(id, callback) {
    db.users.findOne({ _id: id }, (err, data: User) => {
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