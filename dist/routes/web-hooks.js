"use strict";
const web_hook_parser_1 = require("./../helpers/web-hook-parser");
const board_manager_1 = require("./../helpers/board-manager");
const user_1 = require("./../models/user");
const express = require("express");
const router = express.Router();
//Get the webhooks registered for a user_id, recognized by it's trello username
router.get('/user/:user_name', (request, response) => {
    //buscar lista de webhooks almacenados
    response.send('Método no implementado');
});
router.post('/user/:user_name/webhook', (request, response) => {
    //Crea un nuevo webhook para el usuario 
    //Se debe recibir la siguiente información: 
    // - Model id (board, list, card, etc.)
    // - Token del usuario (para poder aplicar cambios desde el webhook)
    response.send('Método no implementado');
});
router.get("/:id", (request, response) => {
    //TODO chequear si existe webhook id registrado
    console.log('Recibido request GET para id: ' + request.params.id);
    response.status(200).send('Exito');
});
router.post("/:id", (request, response) => {
    // console.log('Recibido request POST para id: ' + request.params.id);
    // console.log('Request body:' + request.body);
    //TODO change for custom user
    let token = process.env.TRELLO_TOKEN;
    let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
    let action_data = request.body.action;
    let hook_action = web_hook_parser_1.getWebHookAction(action_data);
    if (hook_action !== web_hook_parser_1.ACTIONS.NONE) {
        let data = _getActionData(hook_action, action_data);
        let board_manager = new board_manager_1.BoardManager(user, data.board_id);
        board_manager.updateAllLists();
    }
    response.sendStatus(200);
});
/**
 * Process a webhook, making the corresponding changes on the board
 * @param {any} hook_action
 * @param {any} action_data
 */
function _getActionData(hook_action, action_data) {
    switch (hook_action) {
        case web_hook_parser_1.ACTIONS.ADD_ITEM:
            return {
                list: action_data.data.list.id,
                board_id: action_data.data.board.id
            };
        case web_hook_parser_1.ACTIONS.REMOVE_ITEM:
            return {
                list: action_data.data.list.id,
                board_id: action_data.data.board.id
            };
        case web_hook_parser_1.ACTIONS.MOVE_ITEM:
            return {
                old: action_data.data.listBefore.id,
                new: action_data.data.listAfter.id,
                list: action_data.data.listAfter.id,
                board_id: action_data.data.board.id
            };
        case web_hook_parser_1.ACTIONS.RENAME_ITEM:
            return {
                old: action_data.data.old.name,
                new: action_data.data.card.name,
                list: action_data.data.list.id,
                board_id: action_data.data.board.id
            };
        default:
            return null;
    }
}
module.exports = router;
//# sourceMappingURL=web-hooks.js.map