import itParam from "mocha-param";
import { expect } from "chai";
import faker from "faker";
import sinon from "sinon";
import winston from "winston";
import { Logger } from "../../src/logger";

describe("Logger", () => {
  let mock: sinon.SinonMock;
  let logger: Logger;
  const loggerMock = {
    child(obj: Record<string, unknown>) {
      void obj;

      return this;
    },
    fatal(s: string) {
      void s;

      return this;
    },
    error(s: string) {
      void s;

      return this;
    },
    warn(s: string) {
      void s;

      return this;
    },
    info(s: string) {
      void s;

      return this;
    },
    debug(s: string) {
      void s;

      return this;
    },
    trace(s: string) {
      void s;

      return this;
    },
  };

  before(() => {
    mock = sinon.mock(winston);

    mock.expects("createLogger").once().returns(loggerMock);

    logger = new Logger({ service: "Mocha" });

    mock.verify();
  });

  after(() => {
    mock.restore();
  });

  itParam<{ level: "fatal" | "error" | "warn" | "info" | "debug" | "trace" }>(
    "logs with a '${value.level}' level",
    [
      { level: "fatal" },
      { level: "error" },
      { level: "warn" },
      { level: "debug" },
      { level: "trace" },
    ],
    ({ level }) => {
      const context = JSON.parse(faker.datatype.json());
      const message = faker.lorem.sentence();

      const childSpy = sinon.spy(loggerMock, "child");
      const levelSpy = sinon.spy(loggerMock, level);

      logger[level](context, message);

      expect(childSpy.calledOnceWith({ context })).to.be.true;
      expect(levelSpy.calledOnceWith(message)).to.be.true;

      childSpy.restore();
      levelSpy.restore();
    },
  );
});
