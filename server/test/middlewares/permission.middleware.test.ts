import { expect } from "chai";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { PermissionMiddleware } from "../../src/middlewares/permission.middleware";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";

const test = sinonTest(sinon);

describe("PermissionMiddleware", () => {
  let middleware: PermissionMiddleware;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    middleware = new PermissionMiddleware();
  }));

  describe("permitRequest", () => {
    it("allows the request when permission function returns true", test(async function () {
      const express = expressMock();
      const next = this.spy(express, "next");
      const f = () => true;

      await middleware.permitRequest(f)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly()).to.be.true;
    }));

    it("disallows the request when permission function returns false", test(async function () {
      const express = expressMock();
      const next = this.spy(express, "next");
      const f = () => false;
      this.stub(ErrorModule, "Forbidden").callsFake(errorMock.Forbidden);

      await middleware.permitRequest(f)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
