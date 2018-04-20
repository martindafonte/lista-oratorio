const User = require('./../models/user');
const querystring = require("querystring");
const request_promise = require('request-promise-native');
const rateLimit = require('rate-limit-promise')

let limiter = rateLimit(300, 10000);

module.exports = class TrelloApiClient {
  /**
   * 
   * @param {User} user 
   */
  constructor(user) {
    this.user = user;
    if (!this._authenticateUser(this.user)) {
      //TODO: Tirrar error y salir
    }
  }


  /**
   * Get the array of Lists on a board
   * @param {string} board_id id of the board
   * @returns {Promise<Array>}
   */
  async getLists(board_id) {
    let res = await this._callTrello('GET', `/boards/${board_id}/lists`, {
      filter: 'open'
    });
    return res;
  }

  /**
   * Get the array of cards with its cards for a board
   * @param {string} board_id id of the board
   * @returns {Promise<Array>}
   */
  async getAllCards(board_id) {
    let options = {
      cards: 'visible',
      card_fields: 'name,id,idList',
      checklists: 'all'
    };
    let res = await this._callTrello('GET', `/boards/${board_id}/cards`, options);
    return res;
  }

  //Permite obtener los checklist que están marcados
  //checkItemStates: 'true'

  async getCardDetails(card_id) {
    let options = {
      fields: 'id,name,idChecklists',
      checklists: 'all',
      checklist_fields: 'id,name'
    };
    let res = await this._callTrello('GET', `/cards/${card_id}`, options);
    return res;
  }

  async getCardsForList(list_id) {
    let options = {
      cards: 'open',
      fields: 'id,name'
    };
    let res = await this._callTrello('GET', `/lists/${list_id}/cards`, options);
    return res;
  }

  async getListsWithCards(board_id) {
    let options = {
      cards: 'open',
      fields: 'id,name',
      card_fields: 'name,id'
    };
    let res = await this._callTrello('GET', `/boards/${board_id}/lists`, options);
    return res;
  }

  async crearCheckList(card_id, checklist_name) {
    let options = {
      name: checklist_name,
      pos: 'top'
    };
    let res = await this._callTrello('POST', `/cards/${card_id}/checklists`, options);
    return res;
  }

  async removeChecklistItem(checklist_id, item_id) {
    let res = await this._callTrello('DELETE', `/checklists/${checklist_id}/checkItems/${item_id}`);
    return res;
  }

  async addChecklistItem(checklist_id, item_name) {
    let options = {
      name: item_name,
      pos: 'bottom',
      checked: false
    };
    let res = await this._callTrello('POST', `/checklists/${checklist_id}/checkItems`, options);
    return Promise.resolve();
  }


  async _authenticateUser(user) {
    //TODO comprobar si está autenticado, intentar autenticación y luego salir
    return true;
  }



  /**
   * Makes a Call to Trello API
   * @param {string} method HTTP method to call
   * @param {string} uri partial uri to call, not necesary to include trello domain and version
   * @param {any} args object with arguments
   * @returns {Promise}
   */
  _callTrello(method, uri, args = null) {
    let host = "https://api.trello.com/1";
    args = args || {};
    var url = host + (uri[0] === "/" ? "" : "/") + uri;

    if (method === "GET") {
      url += "?" + querystring.stringify(this._addAuthArgs(TrelloApiClient._parseQuery(uri, args)));
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
      } else {
        options.formData.file = args.attachment;
      }
    } else {
      options.json = this._addAuthArgs(TrelloApiClient._parseQuery(uri, args));
    }
    // console.log('Making request with:' + JSON.stringify(options));
    return limiter().then(() => request_promise[method.toLowerCase()](options));
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

  static _parseQuery(uri, args) {
    if (uri.indexOf("?") !== -1) {
      var ref = querystring.parse(uri.split("?")[1]);

      for (var key in ref) {
        var value = ref[key];
        args[key] = value;
      }
    }
    return args;
  }

  static _groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

}