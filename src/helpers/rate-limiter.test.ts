import "mocha";
import { expect } from "chai";
import Bottleneck from "bottleneck";
import { resolve } from "dns";


describe("Rate Limiter", function () {
  it("Not above 10 calls per second", function (done) {
    const limiter = new Bottleneck({
      minTime: 10,
      maxConcurrent: 5,
      reservoir: 10,
      reservoirRefreshInterval: 10000,
      reservoirRefreshAmount: 10
    });
    let counter = 0;
    for (let i = 0; i < 40; i++) {
      limiter.schedule(() => new Promise(() => counter++));
    }
    setTimeout(() => done(counter <= 10 ? undefined : "Se realizaron más de 10 invocaciones por segundo"), 900);
  });
});

