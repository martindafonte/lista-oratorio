const fs = require('fs');
const assert = require('assert');
const web_hook_parser = require('./../../src/helpers/web-hook-parser');

fs.readFile('tests/data/samplewebhooks.json', 'UTF8', function (err, data) {
  let json = JSON.parse(data);
  json.forEach(element => {
    let accion = element.accion;
    let body = element.body;
    let resultado = web_hook_parser.getWebHookAction(body.action);
    assert.equal(resultado, web_hook_parser.ACTIONS[accion], 'La acción no coincide con el valor esperado');
  });
});