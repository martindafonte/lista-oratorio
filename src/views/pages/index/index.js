var index_view = require('./index.marko');

module.exports = (request, response) => {
  response.marko(index_view, response.data);
}