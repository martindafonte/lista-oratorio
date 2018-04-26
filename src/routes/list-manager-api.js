const express = require('express');
const User = require('./../models/user');
const BoardManager = require('./../board-manager');
const router = express.Router();


//Crear un nuevo checklist
router.post('/', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let manager = new BoardManager(user, request.body.board_id);
    manager.addDateToLists(request.body.date).then(x => {
        if (x && x.ok) response.send('Se completó la creación de la lista');
        else response.send('Resultado de la operación: ' + JSON.stringify(x));
    }
    ).catch(err =>
        response.sendStatus(500).send('Ocurrió un error al crear la lista. ' + err));
})

//
router.post('/close', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let manager = new BoardManager(user, request.body.board_id);
    console.log(JSON.stringify(request.body));
    response.send('No implementado aún');
}
)

module.exports = router;