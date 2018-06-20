const index_page = require('./../views/pages/index/index');
const User = require('./../models/user');
const BoardManager = require('./../helpers/board-manager');

module.exports = (app) => {
  app.get('/', (req, res) => {
    let token = process.env.TRELLO_TOKEN;
    let user = new User('me', process.env.TRELLO_APIKEY, token);
    let manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      res.data = { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data };
      return index_page(req, res);
    })

  });
}