var index_view = require('./index.marko');

module.exports = (request, response) => {
  response.marko(index_view, { board_id: process.env.TRELLO_TEST_BOARD_ID });
}