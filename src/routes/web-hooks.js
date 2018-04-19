const trello_action_type = require('get-trello-action-type');
const express = require('express');

const router = express.Router();

router.get("/:id", (request, response) => {
  //TODO chequear si existe webhook id registrado
  console.log('Recibido request GET para id: ' + request.params.id);
  response.status(200).send('Exito');
});

router.post("/:id", (request, response) => {
  console.log('Recibido request POST para id: ' + request.params.id);
  console.log('Request body:' + request.body);
  let data = request.body.action;
  let action = _getWebHookAction(data);
  if (action !== ACTIONS.NONE) {
    _processAction(action, data);
  }
  response.sendStatus(200)
  //Procesar Web hook
});

/**
 * Enum of possible actions to perform
 */
const ACTIONS = {
  NONE: 0,
  ADD_ITEM: 1,
  REMOVE_ITEM: 2,
  MOVE_ITEM: 3,
  RENAME_ITEM: 4
};
Object.freeze(ACTIONS);


/**
 * Finds if a web hook must be processed and returns the corresponding action
 * @param {*} data webhook json data
 * @returns {int}
 */
function _getWebHookAction(data) {
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
    //TODO add logging
    return ACTIONS.NONE;
  }
}

function _processAction(action, data) {
  switch (action) {
    case ACTIONS.ADD_ITEM:
      return {
        list: data.list.id
      };
    case ACTIONS.REMOVE_ITEM:
      return {
        list: data.list.id
      };
    case ACTIONS.MOVE_ITEM:
      return {
        old: data.listBefore.id,
        new: data.listAfter.id,
        list: data.listAfter.id
      };
    case ACTIONS.RENAME_ITEM:
      return {
        old: data.old.name,
        new: data.card.name,
        list: data.list.id
      };
    default:
      return null;
  }
}

module.exports = router;