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


  async updateAllLists() {
    let result = await this.client.getListsWithCards(this.boardId);
    if (result.logIfError()) return result;
    let promise_array = result.data.map(list => this._updateAllDatesInList(list));
    return await BoardManager._resultFromPromiseArray(promise_array);
  }

  /**
   * Adds or updates a checklist to the header card of each list
   * @param {string} date Name of the ckeclist to add to the header card
   */
  async addDateToLists(date) {
    return await this._applyToAllLists(date, this._createOrUpdateDateInList);
  }

  /**
   * Close one checklis on the header cards of the board
   * @param {string} date name of the checklist to close
   */
  async closeDate(date) {
    return await this._applyToAllLists(date, this.closeDateInList);
  }

  /**
   * Close one checklis on the header cards of the given list
   * @param {string} date name of the checklist to close
   * @param {any} list list with its cards
   */
  async closeDateInList(date, list) {
    let result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == null) return result;
    let header_data = result.data;
    if (header_data.checklists && header_data.checklists.length > 0) {
      let checklist = header_data.checklists.find(x => x.name == date);
      if (checklist == null) return null; //There is no checklist with given name
      let promise_array = checklist.checkItems.map(item => this._closeCheckItem(list.cards, item, date));
      return await BoardManager._resultFromPromiseArray(promise_array);
    }
  }

  async _applyToAllLists(date, method) {
    let result = await this.client.getListsWithCards(this.boardId);
    if (result.logIfError()) return result;
    let promise_array = result.data.map(list => method(date, list));
    return await BoardManager._resultFromPromiseArray(promise_array);
  }

  async _closeCheckItem(cards, check_item, date) {
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

  async _createOrUpdateDateInList(date, list) {
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
      let check_result = await this.client.crearCheckList(header_data.id, date);
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
    let ret = {
      remove: [],
      add: []
    };
    //Tengo que sacar todos los que no encuentre en el nuevo arreglo
    ret.remove = original_array.filter(x => !new_array.find(y => y == x));
    //Tengo que agregar todos los que no existen en la vieja
    ret.add = new_array.filter(x => !original_array.find(y => y == x));
    return ret;
  }
}


module.exports = BoardManager;