// const User = require('./../models/user');
import { TrelloApiClient } from "./trello-api-client";
import { ApiCallResult as Result } from "./api-call-result";
import { BoardManagerUtils } from "./board-manager-utils";
import { User } from "./../models/user";

export class BoardManager {

  user: User;
  boardId: string;
  private client: TrelloApiClient;
  default_checklist: string;
  ignore: string[];

  updatingBoard: boolean = false;

  /**
   * Constructor de Board Manager
   * @param {User} user
   * @param {string} board_id
   */
  constructor(user: User, board_id: string) {
    this.user = user;
    this.boardId = board_id;
    this.client = new TrelloApiClient(user);
    this.default_checklist = process.env.YEAR; //TODO: cambiar por parámetro asociado al usuario o similar
    this.ignore = (process.env.IGNORE_LISTS || '').split(',');
  }

  /**
   * Returns the lists name and id of the selected board
   */
  async getListsData() {
    const list_result = await this.client.getLists(this.boardId);
    if (list_result.logIfError()) return list_result;
    list_result.data = list_result.data
      .filter(x => this.ignore.indexOf(x.name) < 0)
      .map(x => { return { name: x.name, id: x.id } });
    return list_result;
  }

  /**
   * Update all checklists of all lists
   */
  async updateAllLists() {
    if (this.updatingBoard) //Si se está actualizando no hago caso al webhook
      return new Result(null, null);
    try {
      this.updatingBoard = true;
      return await this._applyToAllLists(this._updateAllDatesInList);
    }
    finally { this.updatingBoard = false; }
  }

  /**
   * Adds or updates a checklist to the header card of each list
   * @param {string} date Name of the ckeclist to add to the header card
   * @param {Array.<string>} listas Listas en las que crear la nueva fecha
   */
  async addDateToLists(date: string, listas: Array<string> = []) {

    try {
      this.updatingBoard = true;
      return await this._applyToAllLists(this._createOrUpdateDateInList, listas, date);
    }
    finally { this.updatingBoard = false; }
  }

  /**
   * Close one checklis on the header cards of the board
   * @param {string} date name of the checklist to close
   * @param {string} comment comment to add to the header card
   * @param {Array.<string>} listas id de las listas para las que se cierra una fecha
   * @returns {Promise<Result>}
   */
  async closeDate(date: string, comment: string, listas: Array<string> = []): Promise<Result> {
    try {
      this.updatingBoard = true;
      return await this._applyToAllLists(this._closeDateInList, listas, date, comment);
    }
    finally { this.updatingBoard = false; }
  }

  /**
   * Apply a method to all lists on the board
   * @param {Function} method Method to apply to each list
   * @param {Array} lists Array of lists id to apply method
   * @param {*} date [Optional] Date to apply
   * @param {Array} args [Optional] Additional arguments
   */
  async _applyToAllLists(method: Function, lists: Array<any> = [], date?: any, ...args: Array<any>) {
    try {
      const result = await this.client.getListsWithCards(this.boardId);
      if (result.logIfError()) return result;
      method = method.bind(this);
      const promise_array = result.data.map(list => {
        if (lists && lists.length > 0 && lists.indexOf(list.id) < 0)// Filtro por las listas
          return undefined;
        else
          return method(list, date, ...args);
      });
      return await BoardManagerUtils.resultFromPromiseArray(promise_array);
    } catch (err) {
      console.error(err);
      return new Result(err);
    }

  }


  /**
   * Close one checklis on the header cards of the given list
   * @param {string} date name of the checklist to close
   * @param {any} list list with cards and its checklists
   * @param {Array.<string>} listas id of the list to close
   */
  async _closeDateInList(list: any, date: string, comment, listas: Array<string> = []) {
    if (listas && listas.indexOf(list.id) < 0) return null;//no está marcada la lista
    const result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == undefined) return result;
    const header_data = result.data;
    if (header_data.checklists && header_data.checklists.length > 0) {
      const checklist = header_data.checklists.find(x => x.name == date);
      if (checklist == undefined) return undefined; // There is no checklist with given name
      // Get the cards with its checklists
      const cards_result = await this.client.getCardsForList(list.id, true);
      if (cards_result.logIfError()) return cards_result;
      list.cards = cards_result.data;
      // Close checkitem for each card
      const promise_array = checklist.checkItems.map(check_item => this._closeCheckItem(list, check_item.name, check_item.state, date));
      // Add comment to header card
      const header_comment = BoardManagerUtils.processComment(checklist.checkItems, date, comment);
      promise_array.push(this.client.addCommentToCard(header_data.id, header_comment));
      const result_array = await BoardManagerUtils.resultFromPromiseArray(promise_array);
      if (!result_array.ok) return result_array;
      // If everything went right, delete the checklist from header card
      return await this.client.removeChecklist(checklist.id);
    }
  }


  async _closeCheckItem(list, card_name, check_item_state, date) {
    let card = BoardManagerUtils.findCardByName(card_name, list.cards);
    if (card == undefined) {
      const card_result = await this.client.addCardToBoard(list.id, card_name);
      if (card_result.logIfError()) return card_result;
      card = card_result.data;
    }
    const checklist_result = await this._findOrCreateCheckList(card, this.default_checklist);
    if (checklist_result.logIfError()) return checklist_result;
    const update_result = await this._updateOrCreateCheckItem(card.id, checklist_result.data, date, check_item_state == "complete");
    if (update_result.logIfError()) return update_result;
    const state = update_result.data.state == "complete";
    return new Result(undefined, state);
  }

  async _updateAllDatesInList(list) {
    const result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == undefined) return result;
    const header_data = result.data;
    const card_name_array = BoardManagerUtils.getCardNameList(list.cards, header_data);
    if (header_data.checklists && header_data.checklists.length > 0) {
      const promise_array = header_data.checklists.map(x => this._updateChecklistInList(x, card_name_array));
      return await BoardManagerUtils.resultFromPromiseArray(promise_array);
    }
    return new Result();
  }

  async _createOrUpdateDateInList(list, date) {
    const result = await this._getHeaderCardDetails(list.name, list.cards);
    if (result.logIfError() || result.data == undefined) return result;
    const header_card = result.data;

    const card_name_array = BoardManagerUtils.getCardNameList(list.cards, header_card);
    const checklist_result = await this._findOrCreateCheckList(header_card, date);
    if (checklist_result.logIfError()) return checklist_result;
    const checklist = checklist_result.data;
    return await this._updateChecklistInList(checklist, card_name_array);
  }

  async _updateChecklistInList(checklist, card_name_array) {
    checklist.checkItems = checklist.checkItems || []; // por si es null
    const changes = BoardManagerUtils.findDifferences(checklist.checkItems.map(x => x.name), card_name_array);
    const change_promise_array = [];
    changes.remove.forEach(x => {
      const item = checklist.checkItems.find(y => y.name == x);
      const promise = this.client.removeChecklistItem(item.idChecklist, item.id);
      change_promise_array.push(promise);
    });
    changes.add.forEach((name, i) => {
      const promise = this.client.addChecklistItem(checklist.id, name, false, i * 10/*posicion*/);
      change_promise_array.push(promise);
    });
    return await BoardManagerUtils.resultFromPromiseArray(change_promise_array);
  }

  async _getHeaderCardDetails(list_name, cards) {
    // TODO buscar en tarjetas de todo el tablero
    const header_card = BoardManagerUtils.findCardByName(list_name, cards);
    if (header_card == undefined) return new Result(); // No encontré header card
    return await this.client.getCardDetails(header_card.id);
  }

  /**
   * Finds a checklist with the same name or create a new one based on the last one
   * @param {any} card Cards with its checklists
   * @param {string} checklist_name Checklist name
   */
  async _findOrCreateCheckList(card: any, checklist_name: string) {
    let base_checklist_id;
    if (card.checklists && card.checklists.length > 0) {
      const key = checklist_name.toLowerCase();
      const checklist = card.checklists.find(x => x.name.toLowerCase() == key);
      if (checklist != undefined) return new Result(undefined, checklist);
      base_checklist_id = card.checklists[card.checklists.length - 1].id;
    }
    const check_result = await this.client.addCheckList(card.id, checklist_name, base_checklist_id);
    return check_result;
  }

  /**
   * Updates the state of a checkitem or creates a new one
   * @param {string} card_id
   * @param {any} checklist
   * @param {string} item_name
   * @param {boolean} state
   */
  async _updateOrCreateCheckItem(card_id: string, checklist: any, item_name: string, state: boolean) {
    const key = item_name.toLowerCase();
    const check_item = checklist.checkItems.find(x => x.name.toLowerCase() == key);
    if (check_item == undefined) {
      return await this.client.addChecklistItem(checklist.id, item_name, state);
    } else if (check_item.state == "complete" || !state) {
      // No need to update
      return new Result(undefined, check_item);
    } else {
      return await this.client.updateChecklistItem(card_id, check_item.id, state);
    }
  }
}