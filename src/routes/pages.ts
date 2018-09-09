//Import Mako views
var index_view = require('./../../views/pages/index/index.marko');
var about_view = require('./../../views/pages/about/index.marko');
var board_view = require('./../../views/pages/boards/index.marko');
import { User } from './../models/user';
import { BoardManager } from './../helpers/board-manager';

export function registerPages(app) {
  let token = process.env.TRELLO_TOKEN;
  let user = new User('me', process.env.TRELLO_APIKEY, token);
  let manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);


  app.get('/', (req, res) => {
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      else res.marko(index_view, { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data });
    });
  });

  app.get('/about', (req, res) => {
    res.marko(about_view, {});
  });

  app.get('/boards', (req, res) => {
    res.marko(board_view, { boards: ['lMr9XHiA', 'lMr9XHiA', 'lMr9XHiA'] });
  });
}