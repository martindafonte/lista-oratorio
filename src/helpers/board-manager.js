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
   * @returns {Promise<Result>}
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
    try {
      let result = await this.client.getListsWithCards(this.boardId, with_checklists);
      if (result.logIfError()) return result;
      method = method.bind(this);
      let promise_array = result.data.map(list => method(list, date, ...args));
      return await BoardManager._resultFromPromiseArray(promise_array);
    } catch (err) {
      console.error(err);
      return new Result(err);
    }

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
      //Close checkitem for each card
      let promise_array = checklist.checkItems.map(check_item => this._closeCheckItem(list.cards, check_item.name, check_item.state, date));
      //Add comment to header card
      let header_comment = BoardManager._processComment(checklist.checkItems, date, comment);
      promise_array.push(this.client.addCommentToCard(header_data.id, header_comment));
      let result_array = await BoardManager._resultFromPromiseArray(promise_array);
      if (!result_array.ok) return result_array;
      //If everything went right, delete the checklist from header card
      return await this.client.removeChecklist(checklist.id);
    }
  }


  async _closeCheckItem(cards, card_name, check_item_state, date) {
    let card = BoardManager._findCardByName(card_name, cards);
    if (card == null) {
      throw new Error('Method not implemented yet: ' + cards.length + JSON.stringify(card_name) + date);
    }
    let checklist_result = await this._findOrCreateCheckList(card, this.default_checklist);
    if (checklist_result.logIfError()) return checklist_result;
    let state = check_item_state == 'complete';
    let update_result = await this._updateOrCreateCheckItem(card.id, checklist_result.data, date, state);
    if (update_result.logIfError()) return update_result;
    return new Result(null, state);
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
    return new Result(null, null);
  }

  async _createOrUpdateDateInList(list, date) {
    let result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == null) return result;
    let header_card = result.data;

    let card_name_array = BoardManager._getCardNameList(list.cards, header_card);
    let checklist_result = await this._findOrCreateCheckList(header_card, date);
    if (checklist_result.logIfError()) return checklist_result;
    let checklist = checklist_result.data;
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
    //TODO buscar en tarjetas de todo el tablero
    let header_card = BoardManager._findCardByName(list_name, cards);
    if (header_card == null) return new Result(null, null); //No encontré header card
    return await this.client.getCardDetails(header_card.id);
  }

  /**
   * Finds a checklist with the same name or create a new one
   * @param {any} card Cards with its checklists
   * @param {string} checklist_name Checklist name
   */
  async _findOrCreateCheckList(card, checklist_name) {
    if (card.checklists && card.checklists.length > 0) {
      let key = checklist_name.toLowerCase();
      let checklist = card.checklists.find(x => x.name.toLowerCase() == key);
      if (checklist != null) return new Result(null, checklist);
    }
    let check_result = await this.client.addCheckList(card.id, checklist_name);
    return check_result;
  }

  /**
   * Updates the state of a checkitem or creates a new one
   * @param {string} card_id 
   * @param {any} checklist 
   * @param {string} item_name 
   * @param {boolean} state 
   */
  async _updateOrCreateCheckItem(card_id, checklist, item_name, state) {
    let key = item_name.toLowerCase();
    let check_item = checklist.checkItems.find(x => x.name.toLowerCase() == key);
    return check_item == null ?
      await this.client.addChecklistItem(checklist.id, item_name, state) :
      await this.client.updateChecklistItem(card_id, check_item.id, state);
  }

  //-------------------------------------------------
  //----------------STATIC METHODS-------------------
  //-------------------------------------------------

  /**
   * Generates a new resume comment from the given parameters
   * @param {*} check_items 
   * @param {string} date 
   * @param {string} comment 
   * @returns {string} formatted comment
   */
  static _processComment(check_items, date, comment) {
    let completed_items = check_items.filter(x => x.state == 'complete');
    let total = check_items.length;
    let cantidad = completed_items.length;
    let detalle = completed_items.map(x => x.name).join(', ').trim();
    return `${date}: ${comment}\nCantidad: ${cantidad}/${total}\nDetalle: ${detalle}`
  }

  /**
   * Returns an unified Promise that resolves to Result
   * @param {Array.<Promise>} promise_array 
   * @returns {Promise<Result>}
   */
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

  static _findCardByName(name, cards) {
    name = name.toLowerCase();
    let header_card = cards.find(x => x.name.toLowerCase() === name);
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