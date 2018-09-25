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
class BoardManagerUtils {
    /**
     * Generates a new resume comment from the given parameters
     * @param {*} check_items
     * @param {string} date
     * @param {string} comment
     * @returns {string} formatted comment
     */
    static processComment(check_items, date, comment) {
        const completed_items = check_items.filter(x => x.state == "complete");
        const total = check_items.length;
        const cantidad = completed_items.length;
        const detalle = completed_items.map(x => x.name).join(", ").trim();
        return `${date}: ${comment}\nCantidad: ${cantidad}/${total}\nDetalle: ${detalle}`;
    }
    /**
     * Returns an unified Promise that resolves to Result
     * @param {Array.<Promise>} promise_array
     * @returns {Promise<Result>}
     */
    static resultFromPromiseArray(promise_array) {
        return __awaiter(this, void 0, void 0, function* () {
            promise_array = promise_array.filter(x => x != undefined && x != undefined);
            return Promise.all(promise_array).then(results => {
                const error = results.find(x => x != undefined && typeof x.logIfError == "function" && x.logIfError());
                return error || new api_call_result_1.ApiCallResult();
            })
                .catch(err => new api_call_result_1.ApiCallResult(err));
        });
    }
    /**
     * Returns the array of names of the cards of the list, except the header card
     * @param {*} list
     * @param {*} header_card
     */
    static getCardNameList(list, header_card) {
        return list.filter(x => x.id !== header_card.id).map(x => x.name).sort();
    }
    static findCardByName(name, cards) {
        name = name.toLowerCase();
        const header_card = cards.find(x => x.name.toLowerCase() === name);
        return header_card;
    }
    static filterList(list_array) {
        // TODO filtrar en base a los parámetros que se definan
        return list_array.filter(() => true);
    }
    static findDifferences(original_array, new_array) {
        return {
            // Remove all items not found on the new array
            remove: original_array.filter(x => !new_array.find(y => y == x)),
            // Add all items not existing on the new array
            add: new_array.filter(x => !original_array.find(y => y == x))
        };
    }
}
exports.BoardManagerUtils = BoardManagerUtils;
//# sourceMappingURL=board-manager-utils.js.map