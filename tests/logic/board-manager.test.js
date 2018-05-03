const assert = require('assert');
const BoardManager = require('./../../src/helpers/board-manager');
const User = require('./../../src/models/user');


/*
function test1() {
  manager.addDateToLists('2018/04/12');
}

function test2() {
  manager.updateAllLists();
}*/

describe('Board Manager', function () {
  var user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
  const manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);

  it('Process comment', function (done) {
    var checkitems = [{
      name: 'uno', state: 'complete'
    }, {
      name: 'dos', state: 'incomplete'
    }, {
      name: 'tres', state: 'complete'
    }];
    let comment = BoardManager._processComment(checkitems, '2018-04-12', 'Llovio');
    let expected = '2018-04-12: Llovio\nCantidad: 2/3\nDetalle: uno, tres'
    assert.equal(comment, expected);
  });

  //TODO Add test to other board manager methods
});