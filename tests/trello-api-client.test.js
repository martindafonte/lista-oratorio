const assert = require('assert');
const TrelloApiClient = require('./../src/helpers/trello-api-client');
const User = require('./../src/models/user');

describe('Trello Api Client', function (done) {
  var user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
  var client = new TrelloApiClient(user);
  it('Gets a List', function (done) {
    let result = client.getLists('0rE87dGP');
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      console.log(JSON.stringify(x));
      done();
    }
    ).catch(err => {
      done(err);
    }
    );
  });
/*
  it('Gets All Cards', function (done) {
    let result = client.getAllCards('0rE87dGP');
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      console.log(JSON.stringify(x));
      done();
    }
    ).catch(err =>
      done(err)
    );
  });

  it('Gets lists with cards', function (done) {
    let result = client.getListsWithCards('0rE87dGP');
    result.then((x) => {
      assert.notEqual(x, undefined, 'Resultado no puede ser undefined');
      assert.notEqual(x, null, 'Resultado no puede ser null');
      assert.notEqual(x.length, 0, 'No se recuperó ninguna lista');
      console.log(JSON.stringify(x));
      done();
    }
    ).catch(err =>
      done(err)
    );
  });
  it('Gets lists from a board', function (done) {
    client.getLists('0rE87dGP').then(x => {
      // console.log('Listas:' + JSON.stringify(x));
      return client.getCardsForList(x[0].id);
    }).then(y => {
      console.log(JSON.stringify(y));
      done();
    }).catch(err => done(err));
  });

  it('Gets all cards from a board', function (done) {
    let result = client.getAllCards('0rE87dGP');
    result.then((x) => client.getCardDetails(x[0].id))
      .then(y => {
        console.log(JSON.stringify(y))
        done();
      }
      ).catch(err => done(err));
  });*/
});