const assert = require('assert');
const board_module = require('./../../dist/src/helpers/board-manager-utils');


describe('Board Manager', function () {
  it('Process comment', function (done) {
    var checkitems = [{
      name: 'uno', state: 'complete'
    }, {
      name: 'dos', state: 'incomplete'
    }, {
      name: 'tres', state: 'complete'
    }];
    let comment = board_module.BoardManagerUtils.processComment(checkitems, '2018-04-12', 'Llovio');
    let expected = '2018-04-12: Llovio\nCantidad: 2/3\nDetalle: uno, tres'
    assert.equal(comment, expected);
    done();
  });

  //TODO Add test to other board manager utils methods
});