const assert = require('assert');
const WebHook = require('./../../src/models/webhook');
describe('webhook model', function () {
  it('should save a web hook', function (done) {
    var webhook = new WebHook('api_key', 'token', '123');
    webhook.saveWebHook(done);
  });
  it('should load a web hook', function (done) {
    var webhook = new WebHook('api_key', 'token', '123');
    webhook.saveWebHook(function (err, data) {
      assert.equal(err, null, err);
      WebHook.findWebHook(data._id, done);
    });
  });
});