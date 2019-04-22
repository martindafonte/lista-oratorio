import express = require('express');
import { User } from './../models/user';
import { BoardManager } from './../helpers/board-manager';
const router = express.Router();

function _processListsFromBody(body){
    let listas = [];
      for (let prop in body) {
        console.log(prop);
          if (prop.startsWith("lista_")) {
              listas.push(body[prop]);
            console.log(prop);
          }
      }
    return listas;
  }

//Crear un nuevo checklist
router.post('/create', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let listas = _processListsFromBody(request.body);
    let manager = new BoardManager(user, request.body.board_id);
    manager.addDateToLists(request.body.date, listas).then(x => {
        if (x && x.ok) response.send('Se completó la creación de la lista');
        else response.send('Resultado de la operación: ' + JSON.stringify(x));
    }
    ).catch(err =>
        response.sendStatus(500).send('Ocurrió un error al crear la lista. ' + err));
})

//Close a list
router.post('/close', (request, response) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    if (!request.body.board_id) {
        response.send('No se encontró un parámetro board_id en el pedido');
        return;
    }
    let listas = _processListsFromBody(request.body);
    let manager = new BoardManager(user, request.body.board_id);
    manager.closeDate(request.body.date, request.body.comment, listas).then(
        res => {
            if (res.error) response.status(500);
            response.send(res.error || 'Operación exitosa');
        }
    ).catch(err => response.status(500).send(err));
}
)

export = router;