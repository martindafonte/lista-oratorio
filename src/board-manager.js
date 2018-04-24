const User = require('./models/user');
const TrelloApiClient = require('./helpers/trello-api-client');
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
  }


  async updateAllLists() {
    let result = await this.client.getListsWithCards(this.boardId);
    if (result.logIfError()) return;
    let promise_array = result.data.map(list => this._updateAllDatesInList(list));
    await Promise.all(promise_array);
  }

  /**
   * Adds or updates a checklist to the header card of each list
   * @param {string} date Name of the ckeclist to add to the header card
   */
  async addDateToLists(date) {
    let result = await this.client.getListsWithCards(this.boardId);
    if (result.logIfError) return;
    let promise_array = result.data.map(list => this._createOrUpdateDateInList(date, list));
    await Promise.all(promise_array);
  }

  //Updates de checklists in the header card of the list
  // async updateList(list_id) { }
  //Adds a new checklist in the header card of the list
  // async addDateToList(date, list_id) {

  // }

  async _updateAllDatesInList(list) {
    let header_card = BoardManager._getHeaderCard(list.name, list.cards);
    if (header_card == null) return; //No encontré header card
    let result = await this.client.getCardDetails(header_card.id);
    if (result.logIfError) return;
    let header_data = result.data;
    let card_name_array = BoardManager._getCardNameList(list.cards, header_card);
    if (header_data.checklists && header_data.checklists.length > 0) {
      let promises = header_data.checklists.map(x => this._updateChecklistInList(x, card_name_array));
      let results = await Promise.all(promises);
      results.forEach(x => x.logIfError());
    }
  }

  async _createOrUpdateDateInList(date, list) {
    let header_card = BoardManager._getHeaderCard(list.name, list.cards);
    if (header_card == null) return; //No encontré header card
    let result = await this.client.getCardDetails(header_card.id);
    if (result.logIfError) return;
    let header_data = result.data;

    let card_name_array = BoardManager._getCardNameList(list.cards, header_card);

    //Finds a checklist with the same name or create a new one
    if (header_data.checklists && header_data.checklists.length > 0) {
      var checklist = header_data.checklists.find(x => x.name.toLowerCase() == date.toLowerCase());
      if (!checklist) {
        let check_result = await this.client.crearCheckList(header_data.id, date);
        if (check_result.logIfError()) return;
        checklist = check_result.data;
      }
    } else {
      let check_result = await this.client.crearCheckList(header_data.id, date);
      if (check_result.logIfError()) return;
      var checklist = check_result.data;
    }
    await this._updateChecklistInList(checklist, card_name_array);
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
      let promise = this.client.addChecklistItem(checklist.id, name);
      change_promise_array.push(promise);
    });
    let res = await Promise.all(change_promise_array);
    res.forEach(x => x.logIfError());
  }

  static _getCardNameList(list, header_card) {
    return list.filter(x => x !== header_card).map(x => x.name);
  }

  static _getHeaderCard(list_name, cards) {
    //TODO buscar dentro de las tarjetas de la lista la que tenga el mismo nombre
    list_name = list_name.toLowerCase();
    let header_card = cards.find(x => x.name.toLowerCase() === list_name);
    if (!header_card) {
      //TODO log error
    }
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