import { expect } from "chai";
import { match, spy, stub } from "sinon";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeValidationService } from "../helpers/services.helper.js";

describe("ValidationMiddleware", () => {
  let middleware: ValidationMiddleware;

  before(function () {
    middleware = new ValidationMiddleware(fakeValidationService);
  });

  describe("validateRequest", () => {
    ["body", "query", "params"].forEach(value =>
      it(`validates a request ${value}`, async function () {
        const express = expressMock({ [value]: {} });
        const validateStub = stub(fakeValidationService, "validate").resolves();
        const next = spy(express, "next");

        await middleware.validateRequest({ [`${value}Schema`]: {} })(express.req, express.res, express.next);

        expect(next.calledOnceWithExactly()).to.be.true;
        validateStub.restore();
      }));

    it("fails to validate a request", async function () {
      const express = expressMock({ body: {} });
      const validateStub = stub(fakeValidationService, "validate").rejects();
      const next = spy(express, "next");

      await middleware.validateRequest<string, unknown, unknown>({ ["bodySchema"]: { type: "string" } })(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      validateStub.restore();
    });
  });
});
