// Import Mako views
const index_view = require("./../../views/pages/index/index.marko");
const about_view = require("./../../views/pages/about/index.marko");
const boards_view = require("./../../views/pages/boards/index.marko");
const editor_view = require("./../../views/pages/editor-listas/index.marko");
import { User } from "./../models/user";
import { BoardsList } from "./../helpers/boards-list";

export function registerPages(app) {
  const token = process.env.TRELLO_TOKEN;
  const user = new User("me", process.env.TRELLO_APIKEY, token);
  const boardList = new BoardsList(process.env.TRELLO_BOARDS, process.env.TRELLO_BOARDS_NAMES, user);

  app.get("/", (req, res) => {
    res.marko(index_view);
  });

  app.get("/about", (req, res) => {
    res.marko(about_view, {});
  });

  app.get("/boards", (req, res) => {
    res.marko(boards_view, { boards: boardList.getBoardList() });
  });

  app.get("/boards/:board_id", (req, res) => {
    let manager = boardList.getBoardManager(req.params.board_id);
    manager.getListsData().then(x => {
      if (x && x.logIfError()) return res.status(500);
      else res.marko(editor_view, { board_id: req.params.board_id, board_name: "Lista Villa", listas: x.data });
    });
  });
}