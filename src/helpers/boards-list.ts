import { BoardManager } from "./board-manager";
import { User } from "./../models/user";
import { assert } from "console";

export class BoardsList {

    boards: any[];
    boardsId: string[];
    boardsManagers: BoardManager[];

    /**
     * Constructor de Boards List
     * @param {string} boards_id
     */
    constructor(boards_id: string, boards_names: string, user: User) {
        assert(boards_names, "Board names should be defined")
        let names = boards_names.split(",");
        this.boardsId = boards_id.split(",");
        this.boards = this.boardsId.map((x, i) => { return { id: x, name: names[i] || "Board" } });
        this.boardsManagers = this.boardsId.map(x => new BoardManager(user, x));
    }

    getBoardList() {
        return this.boards;
    }

    getBoardManager(boardId) {
        return this.boardsManagers.find(x => x.boardId == boardId);
    }
}