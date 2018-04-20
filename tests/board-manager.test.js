const BoardManager = require('./../src/board-manager');
const User = require('./../src/models/user');


var user = new User('me', process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);
const manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);

function test1() {
  manager.addDateToLists('2018/04/12');
}

function test2() {
  manager.updateAllLists();
}

test2();