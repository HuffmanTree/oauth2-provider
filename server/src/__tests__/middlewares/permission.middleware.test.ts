import { expect } from "chai";
import { match, spy } from "sinon";
import { PermissionMiddleware } from "../../middlewares/permission.middleware.js";
import { expressMock } from "../helpers/mocks.helper.js";

describe("PermissionMiddleware", () => {
  let middleware: PermissionMiddleware;

  before(function () {
    middleware = new PermissionMiddleware();
  });

  describe("permitRequest", () => {
    it("allows the request when permission function returns true", async function () {
      const express = expressMock();
      const next = spy(express, "next");
      const f = () => true;

      await middleware.permitRequest(f)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("disallows the request when permission function returns false", async function () {
      const express = expressMock();
      const next = spy(express, "next");
      const f = () => false;

      await middleware.permitRequest(f)(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    });
  });
});
