import "mocha";
import { expect } from "chai";
import { BoardManagerUtils } from "./board-manager-utils";


describe("Board Manager", function () {
  it("Process comment", function (done) {
    const checkitems = [{
      name: "uno", state: "complete"
    }, {
      name: "dos", state: "incomplete"
    }, {
      name: "tres", state: "complete"
    }];
    const comment = BoardManagerUtils.processComment(checkitems, "2018-04-12", "Llovio");
    expect(comment).to.equals("2018-04-12: Llovio\nCantidad: 2/3\nDetalle: uno, tres");
    done();
  });

  // TODO Add test to other board manager utils methods
});