"use strict";
module.exports = class ConfiguredBoard {
    constructor(board_id, default_checklist, web_hook_id) {
        this.board_id = board_id;
        this.default_checklist = default_checklist;
        this.web_hook_id = web_hook_id || null;
    }
    addWebHook(web_hook_id) {
        this.web_hook_id = web_hook_id;
    }
};
//# sourceMappingURL=configured-board.js.map