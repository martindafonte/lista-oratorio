const assert = require('assert');
const TrelloApiClient = require('./../src/helpers/trello-api-client');
const User = require('./../src/models/user');

var user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
var client = new TrelloApiClient(user);

function test1() {
  let result = client.getLists('0rE87dGP');
  result.then((x) => {
    assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
    assert.notEqual(x, null, 'Resultado no puede ser null');
    assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
    console.log(JSON.stringify(x));
  }
  ).catch(err =>
    assert.fail(err)
  );
}

function test2() {
  let result = client.getAllCards('0rE87dGP');
  result.then((x) => {
    assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
    assert.notEqual(x, null, 'Resultado no puede ser null');
    assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
    console.log(JSON.stringify(x));
  }
  ).catch(err =>
    assert.fail(err)
  );
}

function test3() {
  let result = client.getListsWithCards('0rE87dGP');
  result.then((x) => {
    assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
    assert.notEqual(x, null, 'Resultado no puede ser null');
    assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
    console.log(JSON.stringify(x));
  }
  ).catch(err =>
    assert.fail(err)
  );
}


function test4() {
  client.getLists('0rE87dGP').then(x => {
    // console.log('Listas:' + JSON.stringify(x));
    return client.getCardsForList(x[0].id);
  }).then(y => console.log(JSON.stringify(y)));
}

function test5() {
  let result = client.getAllCards('0rE87dGP');
  result.then((x) => client.getCardDetails(x[0].id))
    .then(y => console.log(JSON.stringify(y)));
}

// test1();
// test2();
// test3();
// test4();
test5();