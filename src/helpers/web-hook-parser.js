const trello_action_type = require('get-trello-action-type');

/**
 * Enum of possible actions to perform
 */
const ACTIONS = module.exports.ACTIONS = {
  NONE: 0,
  ADD_ITEM: 1,
  REMOVE_ITEM: 2,
  MOVE_ITEM: 3,
  RENAME_ITEM: 4
};
Object.freeze(ACTIONS);


module.exports.getWebHookAction = getWebHookAction;

/**
 * Finds if a web hook must be processed and returns the corresponding action
 * @param {*} data webhook json data
 * @returns {any} ACTIONS
 */
function getWebHookAction(data) {
  try {
    let type = trello_action_type.getTrelloActionType(data);
    trello_action_type.trelloActionTypes
    let t = trello_action_type.trelloActionTypes;
    switch (type) {
      case t.CREATE_CARD:
        return ACTIONS.ADD_ITEM;
      case t.REMOVE_CARD:
        return ACTIONS.REMOVE_ITEM;
      case t.RENAME_CARD:
        return ACTIONS.RENAME_ITEM;
      case t.MOVE_CARD_BETWEEN_LISTS:
        return ACTIONS.MOVE_ITEM;
      default:
        return ACTIONS.NONE;
    }
  } catch (err) {
    if (err instanceof trello_action_type.UnknownTrelloActionTypeError) {
      if (data.type == 'updateCard' && data.display.translationKey == 'action_archived_card') {
        return ACTIONS.REMOVE_ITEM;
      }
    }
    //TODO add logging
    return ACTIONS.NONE;
  }
}