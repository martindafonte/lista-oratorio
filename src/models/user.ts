import db = require("./database");
import { BaseModel } from "./base-model";
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
    this._id = undefined;
    this.boards_array = undefined;
  }

  saveUser(callback) {
    this.saveOrUpdate(db.users, callback);
  }

  getConfiguredBoards(callback) {
    try {
      if (this.boards_array != undefined) {
        callback(undefined, this.boards_array);
      } else {
        const query = this._id != undefined ? { _id: this._id } : { username: this.username };
        db.users.findOne(query, (err, data: User) => {
          if (err) {
            callback(err, undefined); return;
          }
          this.boards_array = data.boards_array;
          callback(err, this.boards_array);
        });
      }
    }
    catch (err) {
      callback(err, undefined);
    }
  }

  setConfiguredBoard(board) {
    if (!this.boards_array)
      this.boards_array = [];
    this.boards_array.push(board);
  }

  _getData() {
    const data = { username: this.username, api_key: this.api_key, token: this.token, boards_array: undefined };
    if (this.boards_array)
      data.boards_array = this.boards_array;
    return data;
  }

  static findUser(id, callback) {
    db.users.findOne({ _id: id }, (err, data: User) => {
      if (err) {
        callback(err);
      } else {
        const user = new User(data.username, data.api_key, data.token);
        user._id = data._id;
        callback(err, user);
      }
    });
  }
}