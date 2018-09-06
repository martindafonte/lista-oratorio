// import index_page = require('./../../views/pages/index/index');
var index_view = require('./../../views/pages/index/index.marko');
import { User } from './../models/user';
import { BoardManager } from './../helpers/board-manager';

export function registerPages(app){
  app.get('/', (req, res) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    let manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      let data = { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data };
      res.marko(index_view, data);
    });
  });
}