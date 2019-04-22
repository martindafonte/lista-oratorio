import "mocha";
import { expect } from "chai";
import { WebHook } from "./webhook";

describe("webhook model", () => {
  it("should save a web hook", (done) => {
    const webhook = new WebHook("api_key", "token", "123");
    webhook.saveWebHook(done);
  });
  it("should load a web hook", (done) => {
    const webhook = new WebHook("api_key", "token", "123");
    webhook.saveWebHook(function (err, data) {
      expect(err).to.not.exist;
      WebHook.findWebHook(data._id, done);
    });
  });
});