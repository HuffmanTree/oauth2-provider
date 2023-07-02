import { expect } from "chai";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import * as utils from "../../src/utils";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";
import { fakeAuthService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("AuthMiddleware", () => {
  let middleware: AuthMiddleware;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    middleware = new AuthMiddleware(fakeAuthService);
  }));

  describe("authenticate", () => {
    [
      {
        reason: "without 'authorization' header",
        headers: {},
        expectedWWWAuthenticateHeader: "Bearer missing_token",
      },
      {
        reason: "with an unknown scheme",
        headers: { authorization: "Unknown token" },
        expectedWWWAuthenticateHeader: "Bearer unknown_scheme",
      },
      {
        reason: "with an invalid jwt verification",
        headers: { authorization: "Bearer token" },
        expectedWWWAuthenticateHeader: "Bearer invalid_token: invalid signature",
      },
    ].forEach(({ reason, headers, expectedWWWAuthenticateHeader }) =>
      it(`fails to authenticate ${reason}`, test(async function () {
        const express = expressMock({ headers });
        const setHeader = this.spy(express.res, "setHeader");
        const next = this.spy(express, "next");
        this.stub(ErrorModule, "Unauthorized").callsFake(errorMock.Unauthorized);
        this.stub(utils, "unknownToError").callsFake(errorMock.unknownToError);
        this.stub(fakeAuthService, "verify").rejects(new Error("invalid signature"));

        await middleware.authenticate(true)(express.req, express.res, express.next);

        expect(setHeader.calledOnceWithExactly("WWW-Authenticate", expectedWWWAuthenticateHeader)).to.be.true;
        expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      })));

    it("authenticates a client", test(async function () {
      const express = expressMock({ headers: { authorization: "Bearer jwt" } });
      const next = this.spy(express, "next");

      await middleware.authenticate(true)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly()).to.be.true;
    }));

    it("bypasses jwt verification if token is not a jwt", test(async function () {
      const express = expressMock({ headers: { authorization: "Bearer access_token" } });
      const verify = this.spy(fakeAuthService, "verify");
      const next = this.spy(express, "next");

      await middleware.authenticate(false)(express.req, express.res, express.next);

      expect(verify.notCalled).to.be.true;
      expect(next.calledOnceWithExactly()).to.be.true;
    }));
  });
});
