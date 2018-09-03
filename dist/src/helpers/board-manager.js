"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// const User = require('./../models/user');
const trello_api_client_1 = require("./trello-api-client");
const api_call_result_1 = require("./api-call-result");
const board_manager_utils_1 = require("./board-manager-utils");
class BoardManager {
    /**
     * Constructor de Board Manager
     * @param {User} user
     * @param {string} board_id
     */
    constructor(user, board_id) {
        this.user = user;
        this.boardId = board_id;
        this.client = new trello_api_client_1.TrelloApiClient(user);
        this.default_checklist = '2018'; //TODO: cambiar por parámetro asociado al usuario o similar
    }
    /**
     * Returns the lists name and id of the selected board
     */
    getListsData() {
        return __awaiter(this, void 0, void 0, function* () {
            let list_result = yield this.client.getLists(this.boardId);
            if (list_result.logIfError())
                return list_result;
            list_result.data.map(x => { return { name: x.name, id: x.id }; });
            return list_result;
        });
    }
    /**
     * Update all checklists of all lists
     */
    updateAllLists() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._applyToAllLists(this._updateAllDatesInList);
        });
    }
    /**
     * Adds or updates a checklist to the header card of each list
     * @param {string} date Name of the ckeclist to add to the header card
     */
    addDateToLists(date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._applyToAllLists(this._createOrUpdateDateInList, [], date);
        });
    }
    /**
     * Close one checklis on the header cards of the board
     * @param {string} date name of the checklist to close
     * @param {string} comment comment to add to the header card
     * @param {Array.<string>} listas id de las listas para las que se cierra una fecha
     * @returns {Promise<Result>}
     */
    closeDate(date, comment, listas = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._applyToAllLists(this.closeDateInList, listas, date, comment);
        });
    }
    /**
     * Apply a method to all lists on the board
     * @param {Function} method Method to apply to each list
     * @param {Array} lists Array of lists id to apply method
     * @param {*} date [Optional] Date to apply
     * @param {Array} args [Optional] Additional arguments
     */
    _applyToAllLists(method, lists = [], date = null, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.client.getListsWithCards(this.boardId);
                if (result.logIfError())
                    return result;
                method = method.bind(this);
                let promise_array = result.data.map(list => {
                    if (lists && lists.length > 0 && lists.indexOf(list.id) < 0) //Filtro por las listas
                        return null;
                    else
                        return method(list, date, ...args);
                });
                return yield board_manager_utils_1.BoardManagerUtils.resultFromPromiseArray(promise_array);
            }
            catch (err) {
                console.error(err);
                return new api_call_result_1.ApiCallResult(err);
            }
        });
    }
    /**
     * Close one checklis on the header cards of the given list
     * @param {string} date name of the checklist to close
     * @param {any} list list with cards and its checklists
     * @param {Array.<string>} listas id of the list to close
     */
    closeDateInList(list, date, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._getHeaderCardDetails(list.name, list.cards);
            if (result.logIfError() || result.data == null)
                return result;
            let header_data = result.data;
            if (header_data.checklists && header_data.checklists.length > 0) {
                let checklist = header_data.checklists.find(x => x.name == date);
                if (checklist == null)
                    return null; //There is no checklist with given name
                //Get the cards with its checklists
                let cards_result = yield this.client.getCardsForList(list.id, true);
                if (cards_result.logIfError())
                    return cards_result;
                list.cards = cards_result.data;
                //Close checkitem for each card
                let promise_array = checklist.checkItems.map(check_item => this._closeCheckItem(list, check_item.name, check_item.state, date));
                //Add comment to header card
                let header_comment = board_manager_utils_1.BoardManagerUtils.processComment(checklist.checkItems, date, comment);
                promise_array.push(this.client.addCommentToCard(header_data.id, header_comment));
                let result_array = yield board_manager_utils_1.BoardManagerUtils.resultFromPromiseArray(promise_array);
                if (!result_array.ok)
                    return result_array;
                //If everything went right, delete the checklist from header card
                return yield this.client.removeChecklist(checklist.id);
            }
        });
    }
    _closeCheckItem(list, card_name, check_item_state, date) {
        return __awaiter(this, void 0, void 0, function* () {
            let card = board_manager_utils_1.BoardManagerUtils.findCardByName(card_name, list.cards);
            if (card == null) {
                let card_result = yield this.client.addCardToBoard(list.id, card_name);
                if (card_result.logIfError())
                    return card_result;
                card = card_result.data;
            }
            let checklist_result = yield this._findOrCreateCheckList(card, this.default_checklist);
            if (checklist_result.logIfError())
                return checklist_result;
            let update_result = yield this._updateOrCreateCheckItem(card.id, checklist_result.data, date, check_item_state == 'complete');
            if (update_result.logIfError())
                return update_result;
            let state = update_result.data.state == 'complete';
            return new api_call_result_1.ApiCallResult(null, state);
        });
    }
    _updateAllDatesInList(list) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._getHeaderCardDetails(list.name, list.cards);
            if (result.logIfError() || result.data == null)
                return result;
            let header_data = result.data;
            let card_name_array = board_manager_utils_1.BoardManagerUtils.getCardNameList(list.cards, header_data);
            if (header_data.checklists && header_data.checklists.length > 0) {
                let promise_array = header_data.checklists.map(x => this._updateChecklistInList(x, card_name_array));
                return yield board_manager_utils_1.BoardManagerUtils.resultFromPromiseArray(promise_array);
            }
            return new api_call_result_1.ApiCallResult(null, null);
        });
    }
    _createOrUpdateDateInList(list, date) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._getHeaderCardDetails(list.name, list.cards);
            if (result.logIfError() || result.data == null)
                return result;
            let header_card = result.data;
            let card_name_array = board_manager_utils_1.BoardManagerUtils.getCardNameList(list.cards, header_card);
            let checklist_result = yield this._findOrCreateCheckList(header_card, date);
            if (checklist_result.logIfError())
                return checklist_result;
            let checklist = checklist_result.data;
            return yield this._updateChecklistInList(checklist, card_name_array);
        });
    }
    _updateChecklistInList(checklist, card_name_array) {
        return __awaiter(this, void 0, void 0, function* () {
            checklist.checkItems = checklist.checkItems || []; //por si es null
            let changes = board_manager_utils_1.BoardManagerUtils.findDifferences(checklist.checkItems.map(x => x.name), card_name_array);
            let change_promise_array = [];
            changes.remove.forEach(x => {
                let item = checklist.checkItems.find(y => y.name == x);
                let promise = this.client.removeChecklistItem(item.idChecklist, item.id);
                change_promise_array.push(promise);
            });
            changes.add.forEach((name, i) => {
                let promise = this.client.addChecklistItem(checklist.id, name, false, i * 10 /*posicion*/);
                change_promise_array.push(promise);
            });
            return yield board_manager_utils_1.BoardManagerUtils.resultFromPromiseArray(change_promise_array);
        });
    }
    _getHeaderCardDetails(list_name, cards) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO buscar en tarjetas de todo el tablero
            let header_card = board_manager_utils_1.BoardManagerUtils.findCardByName(list_name, cards);
            if (header_card == null)
                return new api_call_result_1.ApiCallResult(null, null); //No encontré header card
            return yield this.client.getCardDetails(header_card.id);
        });
    }
    /**
     * Finds a checklist with the same name or create a new one based on the last one
     * @param {any} card Cards with its checklists
     * @param {string} checklist_name Checklist name
     */
    _findOrCreateCheckList(card, checklist_name) {
        return __awaiter(this, void 0, void 0, function* () {
            let base_checklist_id;
            if (card.checklists && card.checklists.length > 0) {
                let key = checklist_name.toLowerCase();
                let checklist = card.checklists.find(x => x.name.toLowerCase() == key);
                if (checklist != null)
                    return new api_call_result_1.ApiCallResult(null, checklist);
                base_checklist_id = card.checklists[card.checklists.length - 1].id;
            }
            let check_result = yield this.client.addCheckList(card.id, checklist_name, base_checklist_id);
            return check_result;
        });
    }
    /**
     * Updates the state of a checkitem or creates a new one
     * @param {string} card_id
     * @param {any} checklist
     * @param {string} item_name
     * @param {boolean} state
     */
    _updateOrCreateCheckItem(card_id, checklist, item_name, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = item_name.toLowerCase();
            let check_item = checklist.checkItems.find(x => x.name.toLowerCase() == key);
            if (check_item == null) {
                return yield this.client.addChecklistItem(checklist.id, item_name, state);
            }
            else if (check_item.state == 'complete' || !state) {
                //No need to update 
                return new api_call_result_1.ApiCallResult(null, check_item);
            }
            else {
                return yield this.client.updateChecklistItem(card_id, check_item.id, state);
            }
        });
    }
}
exports.BoardManager = BoardManager;
//# sourceMappingURL=board-manager.js.map