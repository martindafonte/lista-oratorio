"use strict";
const express = require("express");
const user_1 = require("./../models/user");
const board_manager_1 = require("./../helpers/board-manager");
const router = express.Router();
//Crear un nuevo checklist
router.post('/', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let manager = new board_manager_1.BoardManager(user, request.body.board_id);
    manager.addDateToLists(request.body.date).then(x => {
        if (x && x.ok)
            response.send('Se completó la creación de la lista');
        else
            response.send('Resultado de la operación: ' + JSON.stringify(x));
    }).catch(err => response.sendStatus(500).send('Ocurrió un error al crear la lista. ' + err));
});
//Close a list
router.post('/close', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let listas = [];
    for (let prop in request.body) {
        if (prop.indexOf("lista_") == 0) {
            listas.push(request.body[prop]);
        }
    }
    let manager = new board_manager_1.BoardManager(user, request.body.board_id);
    manager.closeDate(request.body.date, request.body.comment, listas).then(res => {
        if (res.error)
            response.status(500);
        response.send(res.error || 'Operación exitosa');
    }).catch(err => response.status(500).send(err));
});
module.exports = router;
//# sourceMappingURL=list-manager-api.js.map