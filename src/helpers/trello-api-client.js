const Trello = require('node-trello');
const User = require('./../models/user');
const querystring = require("querystring");
const request_promise = require('request-promise-native');

module.exports = class TrelloApiClient {
  /**
   * 
   * @param {User} user 
   */
  constructor(user) {
    this.user = user;
  }

  /**
   * 
   * @param {string} board_id 
   * @returns {Promise<Array>}
   */
  async getLists(board_id) {
    if (!this._authenticateUser(this.user)) {
      //TODO: Tirrar error y salir
    }
    let client = new Trello(this.user.api_key, this.user.token);
    let res = await this._callTrello('GET', `/boards/${board_id}/lists`, this.user);
    return res;
  }


  async _authenticateUser(user) {
    //TODO comprobar si está autenticado, intentar autenticación y luego salir
    return true;
  }


  /**
   * 
   * @param {*} method 
   * @param {*} uri 
   * @param {*} args 
   * @returns {Promise}
   */
  _callTrello(method, uri, args = null) {
    let host = "https://api.trello.com/1";
    args = args || {};
    var url = host + (uri[0] === "/" ? "" : "/") + uri;

    if (method === "GET") {
      url += "?" + querystring.stringify(this._addAuthArgs(this._parseQuery(uri, args)));
    }
    var options = {
      url: url,
      method: method
    };
    //for methods other than GET
    if (args.attachment) {
      options.formData = {
        key: this.user.api_key,
        token: this.user.token
      };

      if (typeof args.attachment === "string" || args.attachment instanceof String) {
        options.formData.url = args.attachment;
      }
      else {
        options.formData.file = args.attachment;
      }
    }
    else {
      options.json = this._addAuthArgs(this._parseQuery(uri, args));
    }
    return request_promise[method.toLowerCase()](options);
  }

  /**
   * 
   * @param {*} args 
    */
  _addAuthArgs(args) {
    args.key = this.user.api_key;
    if (this.user.token) {
      args.token = this.user.token;
    }
    return args;
  }

  _parseQuery(uri, args) {
    if (uri.indexOf("?") !== -1) {
      var ref = querystring.parse(uri.split("?")[1]);

      for (var key in ref) {
        var value = ref[key];
        args[key] = value;
      }
    }
    return args;
  }

}
