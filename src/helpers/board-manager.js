const User = require('./../models/user');
const TrelloApiClient = require('./trello-api-client');
const Result = require('./api-call-result');
//Buscar todas las listas y tarjetas
//  Para cada lista 
//Buscar una tarjeta que tenga el mismo nombre
//Armar un checklist de nombre "" en la tarjeta de nombre de la lista
//Agregando todas las tarjetas de la lista original


class BoardManager {
  /**
   * Constructor de Board Manager
   * @param {User} user 
   * @param {string} board_id 
   */
  constructor(user, board_id) {
    this.user = user;
    this.boardId = board_id;
    this.client = new TrelloApiClient(user);
    this.default_checklist = '2018'; //TODO: cambiar por parámetro asociado al usuario o similar
  }

  /**
   * Update all checklists of all lists
   */
  async updateAllLists() {
    return await this._applyToAllLists(this._updateAllDatesInList, false);
  }

  /**
   * Adds or updates a checklist to the header card of each list
   * @param {string} date Name of the ckeclist to add to the header card
   */
  async addDateToLists(date) {
    return await this._applyToAllLists(this._createOrUpdateDateInList, false, date);
  }

  /**
   * Close one checklis on the header cards of the board
   * @param {string} date name of the checklist to close
   * @param {string} comment comment to add to the header card
   */
  async closeDate(date, comment) {
    return await this._applyToAllLists(this.closeDateInList, true, date, comment);
  }

  /**
   * Apply a method to all lists on the board
   * @param {*} method Method to apply to each list
   * @param {*} with_checklists Include checklists when retrieving cards
   * @param {*} date [Optional] Date to apply
   * @param {Array} args [Optional] Additional arguments
   */
  async _applyToAllLists(method, with_checklists, date = null, ...args) {
    let result = await this.client.getListsWithCards(this.boardId, with_checklists);
    if (result.logIfError()) return result;
    let promise_array = result.data.map(list => method(list, date, ...args));
    return await BoardManager._resultFromPromiseArray(promise_array);
  }


  /**
   * Close one checklis on the header cards of the given list
   * @param {string} date name of the checklist to close
   * @param {any} list list with cards and its checklists
   */
  async closeDateInList(list, date, comment) {
    let result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == null) return result;
    let header_data = result.data;
    if (header_data.checklists && header_data.checklists.length > 0) {
      let checklist = header_data.checklists.find(x => x.name == date);
      if (checklist == null) return null; //There is no checklist with given name
      let promise_array = checklist.checkItems.map(item => this._closeCheckItem(list.cards, item, date));
      //Add comment on header_card
      return await BoardManager._resultFromPromiseArray(promise_array);
    }
  }


  async _closeCheckItem(cards, check_item, date) {
    //Update or create card
    //Create or update default checklist on card
    //Add or update date on checklist
    throw new Error('Method not implemented yet: ' + cards.length + JSON.stringify(check_item) + date);
  }

  async _updateAllDatesInList(list) {
    let result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == null) return result;
    let header_data = result.data;
    let card_name_array = BoardManager._getCardNameList(list.cards, header_data);
    if (header_data.checklists && header_data.checklists.length > 0) {
      let promise_array = header_data.checklists.map(x => this._updateChecklistInList(x, card_name_array));
      return await BoardManager._resultFromPromiseArray(promise_array);
    }
  }

  async _createOrUpdateDateInList(list, date) {
    let result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == null) return result;
    let header_data = result.data;

    let card_name_array = BoardManager._getCardNameList(list.cards, header_data);

    //Finds a checklist with the same name or create a new one
    let checklist = null;
    if (header_data.checklists && header_data.checklists.length > 0) {
      checklist = header_data.checklists.find(x => x.name.toLowerCase() == date.toLowerCase());
    }
    if (!checklist) {
      let check_result = await this.client.addCheckList(header_data.id, date);
      if (check_result.logIfError()) return check_result;
      checklist = check_result.data;
    }
    return await this._updateChecklistInList(checklist, card_name_array);
  }

  async _updateChecklistInList(checklist, card_name_array) {
    checklist.checkItems = checklist.checkItems || []; //por si es null
    let changes = BoardManager._findDifferences(checklist.checkItems.map(x => x.name), card_name_array);
    let change_promise_array = [];
    changes.remove.forEach(x => {
      let item = checklist.checkItems.find(y => y.name == x);
      let promise = this.client.removeChecklistItem(item.idChecklist, item.id)
      change_promise_array.push(promise);
    });
    changes.add.forEach(name => {
      let promise = this.client.addChecklistItem(checklist.id, name, false);
      change_promise_array.push(promise);
    });
    return await BoardManager._resultFromPromiseArray(change_promise_array);
  }

  async _getHeaderCardDetails(list_name, cards) {
    let header_card = BoardManager._getHeaderCard(list_name, cards);
    if (header_card == null) return new Result(null, null); //No encontré header card
    return await this.client.getCardDetails(header_card.id);
  }


  //-------------------------------------------------
  //----------------STATIC METHODS-------------------
  //-------------------------------------------------


  static async _resultFromPromiseArray(promise_array) {
    promise_array = promise_array.filter(x => x != null && x != undefined);
    let results = await Promise.all(promise_array);
    let error = results.find(x => x != null && typeof x.logIfError == "function" && x.logIfError());
    return error || new Result(null);
  }

  /**
   * Returns the array of names of the cards of the list, except the header card
   * @param {*} list 
   * @param {*} header_card 
   */
  static _getCardNameList(list, header_card) {
    return list.filter(x => x.id !== header_card.id).map(x => x.name);
  }

  static _getHeaderCard(list_name, cards) {
    //TODO buscar en tarjetas de todo el tablero
    list_name = list_name.toLowerCase();
    let header_card = cards.find(x => x.name.toLowerCase() === list_name);
    return header_card;
  }

  static _filterList(list_array) {
    //TODO filtrar en base a los parámetros que se definan
    return list_array.filter(() => true);
  }

  static _findDifferences(original_array, new_array) {
    let ret = {};
    //Remove all items not found on the new array
    ret.remove = original_array.filter(x => !new_array.find(y => y == x));
    //Add all items not existing on the new array
    ret.add = new_array.filter(x => !original_array.find(y => y == x));
    return ret;
  }
}


module.exports = BoardManager;