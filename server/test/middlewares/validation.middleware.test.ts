import { expect } from "chai";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import * as utils from "../../src/utils";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";
import { fakeValidationService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("ValidationMiddleware", () => {
  let middleware: ValidationMiddleware;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    middleware = new ValidationMiddleware(fakeValidationService);
  }));

  describe("validateRequest", () => {
    ["body", "query", "params"].forEach(value =>
      it(`validates a request ${value}`, test(async function () {
        const express = expressMock({ [value]: {} });
        this.stub(fakeValidationService, "validate").resolves();
        const next = this.spy(express, "next");

        await middleware.validateRequest({ [`${value}Schema`]: {} })(express.req, express.res, express.next);

        expect(next.calledOnceWithExactly()).to.be.true;
      })));

    it("fails to validate a request", test(async function () {
      const express = expressMock({ body: {} });
      this.stub(fakeValidationService, "validate").rejects(new Error());
      this.stub(utils, "unknownToError").callsFake(errorMock.unknownToError);
      this.stub(ErrorModule, "BadRequest").callsFake(errorMock.BadRequest);
      const next = this.spy(express, "next");

      await middleware.validateRequest<string, unknown, unknown>({ ["bodySchema"]: { type: "string" } })(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
