const web_hook_parser = require('./../helpers/web-hook-parser');
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
  let action = web_hook_parser.getWebHookAction(data);
  if (action !== web_hook_parser.ACTIONS.NONE) {
    _processAction(action, data);
  }
  response.sendStatus(200)
});


/**
 * Process a webhook, making the corresponding changes on the board
 * @param {any} action 
 * @param {any} data 
 */
function _processAction(action, data) {
  switch (action) {
    case web_hook_parser.ACTIONS.ADD_ITEM:
      return {
        list: data.list.id
      };
    case web_hook_parser.ACTIONS.REMOVE_ITEM:
      return {
        list: data.list.id
      };
    case web_hook_parser.ACTIONS.MOVE_ITEM:
      return {
        old: data.listBefore.id,
        new: data.listAfter.id,
        list: data.listAfter.id
      };
    case web_hook_parser.ACTIONS.RENAME_ITEM:
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