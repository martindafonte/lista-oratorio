const assert = require('assert');
const webhook_module = require('./../../build/models/webhook');
describe('webhook model', function () {
  it('should save a web hook', function (done) {
    var webhook = new webhook_module.WebHook('api_key', 'token', '123');
    webhook.saveWebHook(done);
  });
  it('should load a web hook', function (done) {
    var webhook = new webhook_module.WebHook('api_key', 'token', '123');
    webhook.saveWebHook(function (err, data) {
      assert.equal(err, null, err);
      webhook_module.WebHook.findWebHook(data._id, done);
    });
  });
});