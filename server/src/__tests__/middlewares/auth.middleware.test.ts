import { expect } from "chai";
import { match, spy, mock } from "sinon";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeAuthService } from "../helpers/services.helper.js";

describe("AuthMiddleware", () => {
  let middleware: AuthMiddleware;

  before(function () {
    middleware = new AuthMiddleware(fakeAuthService);
  });

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
      it(`fails to authenticate ${reason}`, async function () {
        const express = expressMock({ headers });
        const setHeader = spy(express.res, "setHeader");
        const next = spy(express, "next");
        const validateMock = mock(fakeAuthService);
        validateMock.expects("verify").rejects(new Error("invalid signature"));

        await middleware.authenticate(true)(express.req, express.res, express.next);

        expect(setHeader.calledOnceWithExactly("WWW-Authenticate", expectedWWWAuthenticateHeader)).to.be.true;
        expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
        validateMock.restore();
      }));

    it("authenticates a client", async function () {
      const express = expressMock({ headers: { authorization: "Bearer jwt" } });
      const next = spy(express, "next");

      await middleware.authenticate(true)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("bypasses jwt verification if token is not a jwt", async function () {
      const express = expressMock({ headers: { authorization: "Bearer access_token" } });
      const verify = spy(fakeAuthService, "verify");
      const next = spy(express, "next");

      await middleware.authenticate(false)(express.req, express.res, express.next);

      expect(verify.notCalled).to.be.true;
      expect(next.calledOnceWithExactly()).to.be.true;
    });
  });
});
