"use strict";
const index_page = require("./../../views/pages/index/index");
const user_1 = require("./../models/user");
const board_manager_1 = require("./../helpers/board-manager");
module.exports = (app) => {
    app.get('/', (req, res) => {
        let token = process.env.TRELLO_TOKEN;
        let user = new user_1.User('me', process.env.TRELLO_APIKEY, token);
        let manager = new board_manager_1.BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);
        manager.getListsData().then(x => {
            if (x && x.logIfError())
                return res.status(500);
            res.data = { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data };
            return index_page(req, res);
        });
    });
};
