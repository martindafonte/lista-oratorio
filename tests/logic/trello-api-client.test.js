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
      assert.notEqual(x.ok, false, 'Resultado no puede ser falso');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('Gets All Cards', function (done) {
    client.getAllCards(board_id)
      .then((res) => {
        assert.notEqual(res, undefined, 'Resultado no puede ser undefined');
        assert.notEqual(res, null, 'Resultado no puede ser null');
        assert.notEqual(res.ok, false, 'Resultado no puede ser falso');
        assert.notEqual(res.length, 0, 'No se recuperó ninguna lista');
        done();
      }).catch(err =>
        done(err)
      );
  });

  it('Gets lists with cards', function (done) {
    client.getListsWithCards(board_id)
      .then((x) => {
        assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
        assert.notEqual(x, null, 'Resultado no puede ser null');
        assert.notEqual(x.ok, false, 'Resultado no puede ser falso');
        assert.notEqual(x.data.length, 0, 'No se recuperó ninguna lista');
        done();
      }).catch(err =>
        done(err)
      );
  });
  
  it('Gets lists from a board', function (done) {
    client.getLists(board_id)
      .then(x => {
        assert.notEqual(x, null, 'Resultado no puede ser nulo');
        assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
        assert.notEqual(x.ok, false, 'Resultado no puede ser falso');
        assert.notEqual(x.data.length, 0, 'Debe haber al menos un resultado');
        return client.getCardsForList(x.data[0].id);
      })
      .then(() => done())
      .catch(err => done(err));
  });

  it('Gets card details from one of the cards from a board', function (done) {
    client.getAllCards(board_id)
      .then((x) => client.getCardDetails(x.data[0].id))
      .then(resultado => {
        assert.notEqual(resultado.ok, false);
        done();
      })
      .catch(err => done(err));
  });
});