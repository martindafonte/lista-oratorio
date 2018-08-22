"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trello_action_type = require("get-trello-action-type");
/**
 * Enum of possible actions to perform
 */
exports.ACTIONS = {
    NONE: 0,
    ADD_ITEM: 1,
    REMOVE_ITEM: 2,
    MOVE_ITEM: 3,
    RENAME_ITEM: 4
};
Object.freeze(exports.ACTIONS);
/**
 * Finds if a web hook must be processed and returns the corresponding action
 * @param {*} data webhook json data
 * @returns {any} ACTIONS
 */
function getWebHookAction(data) {
    try {
        let type = trello_action_type.getTrelloActionType(data);
        trello_action_type.trelloActionTypes;
        let t = trello_action_type.trelloActionTypes;
        switch (type) {
            case t.CREATE_CARD:
                return exports.ACTIONS.ADD_ITEM;
            case t.REMOVE_CARD:
                return exports.ACTIONS.REMOVE_ITEM;
            case t.RENAME_CARD:
                return exports.ACTIONS.RENAME_ITEM;
            case t.MOVE_CARD_BETWEEN_LISTS:
                return exports.ACTIONS.MOVE_ITEM;
            default:
                return exports.ACTIONS.NONE;
        }
    }
    catch (err) {
        if (err instanceof trello_action_type.UnknownTrelloActionTypeError) {
            if (data.type == 'updateCard' && data.display.translationKey == 'action_archived_card') {
                return exports.ACTIONS.REMOVE_ITEM;
            }
        }
        //TODO add logging
        return exports.ACTIONS.NONE;
    }
}
exports.getWebHookAction = getWebHookAction;
