"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import index_page = require('./../../views/pages/index/index');
var index_view = require('./../../views/pages/index/index.marko');
const user_1 = require("./../models/user");
const board_manager_1 = require("./../helpers/board-manager");
function registerPages(app) {
    app.get('/', (req, res) => {
        let token = process.env.TRELLO_TOKEN;
        let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
        let manager = new board_manager_1.BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);
        manager.getListsData().then(x => {
            if (x && x.logIfError())
                return res.status(500);
            let data = { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data };
            res.marko(index_view, data);
        });
    });
}
exports.registerPages = registerPages;
//# sourceMappingURL=pages.js.map