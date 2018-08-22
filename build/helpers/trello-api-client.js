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
const api_call_result_1 = require("./api-call-result");
const querystring = require("querystring");
const request_promise = require("request-promise-native");
const rateLimit = require("rate-limit-promise");
let limiter = rateLimit(95, 10000); //límite por token es de 100 cada 10s
class TrelloApiClient {
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
    getLists(board_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this._callTrello('GET', `/boards/${board_id}/lists`, {
                filter: 'open'
            });
            return res;
        });
    }
    /**
     * Get the array of cards with its cards for a board
     * @param {string} board_id id of the board
     * @returns {Promise<Result>}
     */
    getAllCards(board_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                cards: 'visible',
                card_fields: 'name,id,idList',
                checklists: 'all'
            };
            let res = yield this._callTrello('GET', `/boards/${board_id}/cards`, options);
            return res;
        });
    }
    //Permite obtener los checklist que están marcados
    //checkItemStates: 'true'
    /**
     *
     * @param {*} card_id
     * @returns {Promise<Result>}
     */
    getCardDetails(card_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                fields: 'id,name,idChecklists',
                checklists: 'all',
                checklist_fields: 'id,name'
            };
            let res = yield this._callTrello('GET', `/cards/${card_id}`, options);
            return res;
        });
    }
    /**
     *
     * @param {string} list_id
     * @param {boolean} with_checklists
     * @returns {Promise<Result>}
     */
    getCardsForList(list_id, with_checklists = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                cards: 'open',
                fields: 'id,name',
                checklists: with_checklists ? 'all' : 'none'
            };
            let res = yield this._callTrello('GET', `/lists/${list_id}/cards`, options);
            return res;
        });
    }
    /**
     *
     * @param {*} board_id
     * @returns {Promise<Result>}
     */
    getListsWithCards(board_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                cards: 'open',
                fields: 'id,name',
                card_fields: 'name,id'
            };
            let res = yield this._callTrello('GET', `/boards/${board_id}/lists`, options);
            return res;
        });
    }
    /**
     *
     * @param {*} card_id
     * @param {*} checklist_name
     * @returns {Promise<Result>}
     */
    addCheckList(card_id, checklist_name, base_checklist_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                name: checklist_name,
                idChecklistSource: base_checklist_id || null
            };
            let res = yield this._callTrello('POST', `/cards/${card_id}/checklists`, options);
            return res;
        });
    }
    /**
     * Adds a new checkitem with the given name to the card
     * @param {string} checklist_id
     * @param {string} item_name
     * @param {boolean} checked
     * @param {string} position bottom or top
     * @returns {Promise<Result>}
     */
    addChecklistItem(checklist_id, item_name, checked, position = 'bottom') {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                name: item_name,
                pos: position,
                checked: checked
            };
            let res = yield this._callTrello('POST', `/checklists/${checklist_id}/checkItems`, options);
            return res;
        });
    }
    /**
     * Add a new comment to a card
     * @param {string} card_id
     * @param {string} comment
     */
    addCommentToCard(card_id, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                text: comment,
            };
            return yield this._callTrello('POST', `/cards/${card_id}/actions/comments`, options);
        });
    }
    /**
     * Add a new card to the given list
     * @param {string} list_id id of the list where the card will be added
     * @param {string} name Name of the card
     * @returns {Promise<Result>}
     */
    addCardToBoard(list_id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                idList: list_id,
                name: name,
                pos: 'bottom'
            };
            return yield this._callTrello('POST', `/cards`, options);
        });
    }
    /**
     * Updates a checklist item
     * @param {string} card_id
     * @param {string} checkitem_id
     * @param {boolean} checked
     */
    updateChecklistItem(card_id, checkitem_id, checked) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                state: checked ? 'complete' : 'incomplete'
            };
            return yield this._callTrello('PUT', `/cards/${card_id}/checkItem/${checkitem_id}`, options);
        });
    }
    /**
     * Remove a checklist item from a checklist
     * @param {*} checklist_id
     * @param {*} item_id
     * @returns {Promise<Result>}
     */
    removeChecklistItem(checklist_id, item_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._callTrello('DELETE', `/checklists/${checklist_id}/checkItems/${item_id}`);
        });
    }
    /**
     * Remove a checklist item from a checklist
     * @param {*} checklist_id
     * @returns {Promise<Result>}
     */
    removeChecklist(checklist_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._callTrello('DELETE', `/checklists/${checklist_id}`);
        });
    }
    _authenticateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO comprobar si está autenticado, intentar autenticación y luego salir
            return true;
        });
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
            }
            else {
                options.formData.file = args.attachment;
            }
        }
        else {
            options.json = this._addAuthArgs(TrelloApiClient._parseQuery(uri, args));
        }
        // console.log('Making request with:' + JSON.stringify(options));
        return limiter().then(() => request_promise[method.toLowerCase()](options))
            .then(data => new api_call_result_1.ApiCallResult(null, data))
            //TODO diferenciar si el error es de limiter o de request_promise
            .catch(err => new api_call_result_1.ApiCallResult(err));
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
    }
    ;
}
exports.TrelloApiClient = TrelloApiClient;
