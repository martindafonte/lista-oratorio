const web_hook_parser = require('./../helpers/web-hook-parser');
const BoardManger = require('./../board-manager');
const User = require('./../models/user');
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
  //TODO change for custom user
  let user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
  let action_data = request.body.action;
  let hook_action = web_hook_parser.getWebHookAction(action_data);
  if (hook_action !== web_hook_parser.ACTIONS.NONE) {
    let data = _getActionData(hook_action, action_data);
    let board_manager = new BoardManger(user, data.board_id);
    board_manager.updateAllLists();
  }
  response.sendStatus(200)
});


/**
 * Process a webhook, making the corresponding changes on the board
 * @param {any} hook_action 
 * @param {any} action_data 
 */
function _getActionData(hook_action, action_data) {
  switch (hook_action) {
    case web_hook_parser.ACTIONS.ADD_ITEM:
      return {
        list: action_data.data.list.id,
        board_id: action_data.data.board.id
      };
    case web_hook_parser.ACTIONS.REMOVE_ITEM:
      return {
        list: action_data.data.list.id,
        board_id: action_data.data.board.id
      };
    case web_hook_parser.ACTIONS.MOVE_ITEM:
      return {
        old: action_data.listBefore.id,
        new: action_data.listAfter.id,
        list: action_data.listAfter.id,
        board_id: action_data.data.board.id
      };
    case web_hook_parser.ACTIONS.RENAME_ITEM:
      return {
        old: action_data.old.name,
        new: action_data.card.name,
        list: action_data.data.list.id,
        board_id: action_data.data.board.id
      };
    default:
      return null;
  }
}

module.exports = router;