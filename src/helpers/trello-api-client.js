var Trello = require('node-trello');

async function getLists(user, board_id) {
  if (!_authenticateUser(user)) {
    //TODO: Tirrar error y salir
  }
  let client = new Trello(user.key, user.token);
  return await client.get('/lists');
}


async function _authenticateUser(user) {
  //TODO comprobar si está autenticado, intentar autenticación y luego salir
  return true;
}

module.exports = {
  getLists: getLists
}