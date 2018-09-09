const fs = require('fs');
const assert = require('assert');
const web_hook_parser = require('./../../dist/helpers/web-hook-parser');

describe('Web Hook Parser', function () {
  it('Clasificar web hooks', function (done) {
    fs.readFile('tests/data/samplewebhooks.json', 'UTF8', function procesarArchivo(err, data) {
      let json = JSON.parse(data);
      json.forEach(element => {
        let accion = element.accion;
        let body = element.body;
        let resultado = web_hook_parser.getWebHookAction(body.action);
        assert.equal(resultado, web_hook_parser.ACTIONS[accion], 'La acción no coincide con el valor esperado');
      });
      done();
    });

  })
})
