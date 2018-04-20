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

  async addDateToLists(date) {
    let lists = await this.getLists();
    let promise_array = lists.map(list => this.addDateToList(date, list));
    await Promise.all(promise_array);
  }

  async addDateToList(date, list) {
    let header_card = BoardManager._getHeaderCard(list);
    let names = BoardManager._getCardNameList(list, header_card);
    //Si no existe un checklist de nombre date -> crearlo
    //Si existe -> actualizarlo
  }

  async getLists() {

    let lists = await this.client.getLists(this.boardId);
    return BoardManager._filterList(lists);;
  }

  static _getCardNameList(list, header_card) {
    return list.filter(x => x !== header_card).map(x => x.name);
  }

  static _getHeaderCard(list) {
    //TODO buscar dentro de las tarjetas de la lista la que tenga el mismo nombre
    let list_name = list.name.toLowerCase();
    let header_card = list.cards.find(x => x.name.toLowerCase() === list_name);
    if (header_card) {
      return header_card[0];
    } else {
      //TODO log error
      return null;
    }
  }

  static _filterList(list_array) {
    //TODO filtrar en base a los parámetros que se definan
    return list_array.filter(() => true);
  }

}


module.exports = BoardManager;