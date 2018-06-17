const User = require('./../models/user');
const Result = require('./api-call-result');
const querystring = require("querystring");
const request_promise = require('request-promise-native');
const rateLimit = require('rate-limit-promise')

let limiter = rateLimit(95, 10000); //límite por token es de 100 cada 10s

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
   * @returns {Promise<Result>}
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
   * @returns {Promise<Result>}
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
  /**
   * 
   * @param {*} card_id 
   * @returns {Promise<Result>}
   */
  async getCardDetails(card_id) {
    let options = {
      fields: 'id,name,idChecklists',
      checklists: 'all',
      checklist_fields: 'id,name'
    };
    let res = await this._callTrello('GET', `/cards/${card_id}`, options);
    return res;
  }

  /**
   * 
   * @param {string} list_id 
   * @param {boolean} with_checklists
   * @returns {Promise<Result>}
   */
  async getCardsForList(list_id, with_checklists = false) {
    let options = {
      cards: 'open',
      fields: 'id,name',
      checklists: with_checklists ? 'all' : 'none'
    };
    let res = await this._callTrello('GET', `/lists/${list_id}/cards`, options);
    return res;
  }

  /**
   * 
   * @param {*} board_id 
   * @returns {Promise<Result>}
   */
  async getListsWithCards(board_id) {
    let options = {
      cards: 'open',
      fields: 'id,name',
      card_fields: 'name,id'
    };
    let res = await this._callTrello('GET', `/boards/${board_id}/lists`, options);
    return res;
  }

  /**
   * 
   * @param {*} card_id 
   * @param {*} checklist_name 
   * @returns {Promise<Result>}
   */
  async addCheckList(card_id, checklist_name, base_checklist_id) {
    let options = {
      name: checklist_name
    };
    if (base_checklist_id) options.idChecklistSource = base_checklist_id;
    let res = await this._callTrello('POST', `/cards/${card_id}/checklists`, options);
    return res;
  }

  /**
   * Adds a new checkitem with the given name to the card
   * @param {string} checklist_id 
   * @param {string} item_name 
   * @param {boolean} checked 
   * @param {string} position bottom or top
   * @returns {Promise<Result>}
   */
  async addChecklistItem(checklist_id, item_name, checked, position = 'bottom') {
    let options = {
      name: item_name,
      pos: position,
      checked: checked
    };
    let res = await this._callTrello('POST', `/checklists/${checklist_id}/checkItems`, options);
    return res;
  }

  /**
   * Add a new comment to a card
   * @param {string} card_id 
   * @param {string} comment 
   */
  async addCommentToCard(card_id, comment) {
    let options = {
      text: comment,
    };
    return await this._callTrello('POST', `/cards/${card_id}/actions/comments`, options);
  }

  /**
   * Add a new card to the given list
   * @param {string} list_id id of the list where the card will be added
   * @param {string} name Name of the card
   * @returns {Promise<Result>}
   */
  async addCardToBoard(list_id, name) {
    let options = {
      idList: list_id,
      name: name,
      pos: 'bottom'
    }
    return await this._callTrello('POST', `/cards`, options);
  }

  /**
   * Updates a checklist item
   * @param {string} card_id
   * @param {string} checkitem_id 
   * @param {boolean} checked 
   */
  async updateChecklistItem(card_id, checkitem_id, checked) {
    let options = {
      state: checked ? 'complete' : 'incomplete'
    };
    return await this._callTrello('PUT', `/cards/${card_id}/checkItem/${checkitem_id}`, options);
  }

  /**
   * Remove a checklist item from a checklist
   * @param {*} checklist_id 
   * @param {*} item_id 
   * @returns {Promise<Result>}
   */
  async removeChecklistItem(checklist_id, item_id) {
    return await this._callTrello('DELETE', `/checklists/${checklist_id}/checkItems/${item_id}`);
  }

  /**
   * Remove a checklist item from a checklist
   * @param {*} checklist_id 
   * @returns {Promise<Result>}
   */
  async removeChecklist(checklist_id) {
    return await this._callTrello('DELETE', `/checklists/${checklist_id}`);
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
   * @returns {Promise<Result>}
   * @throws Exceptions when a call failed on the API
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
    return limiter().then(() =>
      request_promise[method.toLowerCase()](options))
      .then(data => new Result(null, data))
      //TODO diferenciar si el error es de limiter o de request_promise
      .catch(err => new Result(err));
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