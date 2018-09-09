"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Import Mako views
var index_view = require('./../../views/pages/index/index.marko');
var about_view = require('./../../views/pages/about/index.marko');
var board_view = require('./../../views/pages/boards/index.marko');
const user_1 = require("./../models/user");
const board_manager_1 = require("./../helpers/board-manager");
function registerPages(app) {
    let token = process.env.TRELLO_TOKEN;
    let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
    let manager = new board_manager_1.BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);
    app.get('/', (req, res) => {
        manager.getListsData().then(x => {
            if (x && x.logIfError())
                return res.status(500);
            else
                res.marko(index_view, { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data });
        });
    });
    app.get('/about', (req, res) => {
        res.marko(about_view, {});
    });
    app.get('/boards', (req, res) => {
        res.marko(board_view, { boards: ['lMr9XHiA', 'lMr9XHiA', 'lMr9XHiA'] });
    });
}
exports.registerPages = registerPages;
//# sourceMappingURL=pages.js.map