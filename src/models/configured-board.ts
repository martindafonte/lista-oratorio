export = class ConfiguredBoard {

  board_id: string;
  default_checklist: string;
  web_hook_id: string;

  constructor(board_id: string, default_checklist: string, web_hook_id?: string) {
    this.board_id = board_id;
    this.default_checklist = default_checklist;
    this.web_hook_id = web_hook_id || null;
  }

  addWebHook(web_hook_id) {
    this.web_hook_id = web_hook_id;
  }

}