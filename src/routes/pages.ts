// Import Mako views
const index_view = require("./../../views/pages/index/index.marko");
const about_view = require("./../../views/pages/about/index.marko");
const boards_view = require("./../../views/pages/boards/index.marko");
const editor_view = require("./../../views/pages/editor-listas/index.marko");
import { User } from "./../models/user";
import { BoardManager } from "./../helpers/board-manager";

export function registerPages(app) {
  const token = process.env.TRELLO_TOKEN;
  const user = new User("me", process.env.TRELLO_APIKEY, token);
  const manager = new BoardManager(user, process.env.TRELLO_TEST_BOARD_ID);


  app.get("/", (req, res) => {
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      else res.marko(index_view, { board_id: process.env.TRELLO_TEST_BOARD_ID, listas: x.data });
    });
  });

  app.get("/about", (req, res) => {
    res.marko(about_view, {});
  });

  app.get("/boards", (req, res) => {
    res.marko(boards_view, { boards: [{ id: "lMr9XHiA", name: "Tablero 1" }, { id: "lMr9XHiA", name: "Tablero 2" }, { id: "lMr9XHiA", name: "Tablero 3" }] });
  });

  app.get("/boards/:board_id", (req, res) => {
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      else res.marko(editor_view, { board_id: req.params.board_id, board_name: "Lista Villa", listas: x.data });
    });
  });
}