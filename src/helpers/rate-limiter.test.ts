import "mocha";
import { expect } from "chai";
import rateLimit = require("rate-limit-promise");

describe("Rate Limiter", function () {
  it("Not above 10 calls per second", function (done) {
    const limiter = rateLimit(10, 1000);
    let counter = 0;
    for (let i = 0; i < 40; i++) {
      limiter().then(() => counter++);
    }
    setTimeout(() => done(counter == 10 ? undefined : "Se realizaron más de 10 invocaciones por segundo"), 900);
  });
});

