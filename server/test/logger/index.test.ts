import { expect } from "chai";
import sinon from "sinon";
import sinonTest from "sinon-test";
import winston from "winston";
import { Logger } from "../../src/logger";
import { winstonMock } from "../helpers/mocks.helper";

const test = sinonTest(sinon);

describe("Logger", () => {
  let logger: Logger;

  before(test(function() {
    this.stub(winston, "createLogger").callsFake(() => winstonMock);
    logger = new Logger({ service: "Mocha" });
  }));

  ["fatal", "error", "warn", "info", "debug", "trace"].forEach(level =>
    it(`logs with a '${level}' level`, test(function() {
      const child = this.spy(winstonMock, "child");
      const fn = this.spy(winstonMock, level);

      logger[level]({ userId: "id" }, "My message");

      expect(child.calledOnceWithExactly({ context: { userId: "id" } })).to.be.true;
      expect(fn.calledOnceWithExactly("My message")).to.be.true;
    })));
});
