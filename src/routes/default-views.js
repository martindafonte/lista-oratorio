var index_view = require('./../../views/index.marko');

module.exports = (app) => {
  app.get('/', (request, response) => {
    response.marko(index_view, { board_id: process.env.TRELLO_TEST_BOARD_ID });
  });
}