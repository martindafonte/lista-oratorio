const index_page = require('./../views/pages/index/index');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.data = { board_id: process.env.TRELLO_TEST_BOARD_ID };
    return index_page(req, res);
  });
}