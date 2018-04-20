const assert = require('assert');
const TrelloApiClient = require('./../src/helpers/trello-api-client');
const User = require('./../src/models/user');

let user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);

let client = new TrelloApiClient(user);

let result = client.getLists('0rE87dGP');
result.then((x) => {
  assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
  assert.notEqual(x, null, 'Resultado no puede ser null');
  assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
}
).catch(err =>
  assert.fail(err)
);
