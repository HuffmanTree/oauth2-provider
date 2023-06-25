import { describe } from "node:test";
import { expect } from "chai";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
  ErrorMiddleware,
  Conflict,
} from "../../src/middlewares/error.middleware";
import * as utils from "../../src/utils";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";

const test = sinonTest(sinon);

describe("Error classes", () => {
  [
    { fn: BadRequest, expectedStatus: 400 },
    { fn: Unauthorized, expectedStatus: 401 },
    { fn: Forbidden, expectedStatus: 403 },
    { fn: NotFound, expectedStatus: 404 },
    { fn: Conflict, expectedStatus: 409 },
    { fn: InternalServerError, expectedStatus: 500 },
  ].forEach(({ fn, expectedStatus }) =>
    it(`builds a ${fn.name}`, function () {
      const err = new fn(new Error("error message"));

      expect(err).to.be.instanceOf(fn);
      expect(err)
        .to.have.property("message")
        .and.to.be.a("string")
        .and.to.equal("error message");
      expect(err)
        .to.have.property("name")
        .and.to.be.a("string")
        .and.to.equal(fn.name);
      expect(err)
        .to.have.property("status")
        .and.to.be.a("number")
        .and.to.equal(expectedStatus);
    }));
});

describe("ErrorMiddleware", () => {
  let middleware: ErrorMiddleware;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    middleware = new ErrorMiddleware();
  }));

  describe("notFound", () => {
    it("falls to notFound", test(async function () {
      const express = expressMock();
      const next = this.spy(express, "next");

      await middleware.notFound(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(NotFound))).to.be.true;
    }));
  });

  describe("handleError", () => {
    [
      {
        type: "an 'HttpError'",
        err: new BadRequest(new Error("Missing property 'email'")),
        expectedStatus: 400,
        expectedJson: { message: "Missing property 'email'", status: 400, name: "BadRequest" },
      },
      {
        type: "an 'Error'",
        err: new Error("Uncaught error"),
        expectedStatus: 500,
        expectedJson: { message: "Uncaught error", status: 500, name: "InternalServerError" },
      },
      {
        type: "a string",
        err: "Uncaught string",
        expectedStatus: 500,
        expectedJson: { message: "Uncaught string", status: 500, name: "InternalServerError" },
      },
    ].forEach(({ type, err, expectedStatus, expectedJson }) =>
      it(`falls to handleError with ${type}`, test(async function () {
        this.stub(utils, "unknownToError").callsFake(errorMock.unknownToError);
        const express = expressMock();
        const status = this.spy(express.res, "status");
        const json = this.spy(express.res, "json");

        await middleware.handleError(err, express.req, express.res, express.next);

        expect(status.calledOnceWithExactly(expectedStatus)).to.be.true;
        expect(json.calledOnceWithExactly(expectedJson)).to.be.true;
      })));
  });
});
