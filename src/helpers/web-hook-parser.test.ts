import * as fs from "fs";
import "mocha";
import { expect } from "chai";
import { getWebHookAction, ACTIONS } from "./web-hook-parser";

describe("Web Hook Parser", function () {
  it("Clasificar web hooks", function (done) {
    fs.readFile("sample_data/samplewebhooks.json", "UTF8", function procesarArchivo(err, data) {
      const json = JSON.parse(data);
      json.forEach(element => {
        const accion = element.accion;
        const body = element.body;
        const resultado = getWebHookAction(body.action);
        expect(resultado).to.be.eq(ACTIONS[accion], "La acción no coincide con el valor esperado");
      });
      done();
    });
  });
});
