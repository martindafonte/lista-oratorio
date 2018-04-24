
require('dotenv').config()  
const assert = require('assert');
const TrelloApiClient = require('./../../src/helpers/trello-api-client');
const User = require('./../../src/models/user');

describe('Trello Api Client', function (done) {
  var user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
  var board_id = process.env.TRELLO_TEST_BOARD_ID;
  var client = new TrelloApiClient(user);
  
  it('Gets a List', function (done) {
    let result = client.getLists(board_id);
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      done();
    }
    ).catch(err => {
      done(err);
    }
    );
  });

  it('Gets All Cards', function (done) {
    let result = client.getAllCards(board_id);
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      done();
    }
    ).catch(err =>
      done(err)
    );
  });

  it('Gets lists with cards', function (done) {
    let result = client.getListsWithCards(board_id);
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      done();
    }
    ).catch(err =>
      done(err)
    );
  });
  it('Gets lists from a board', function (done) {
    client.getLists(board_id).then(x => {
      // console.log('Listas:' + JSON.stringify(x));
      return client.getCardsForList(x[0].id);
    }).then(y => {
      done();
    }).catch(err => done(err));
  });

  it('Gets all cards from a board', function (done) {
    let result = client.getAllCards(board_id);
    result.then((x) => client.getCardDetails(x[0].id))
      .then(y => {
        done();
      }
      ).catch(err => done(err));
  });
});