import sinon from "sinon";
import {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
  ErrorMiddleware,
  Conflict,
} from "../../src/middlewares/error.middleware";
import faker from "faker";
import itParam from "mocha-param";
import { expect } from "chai";

describe("Error classes", () => {
  itParam<
    [
      (
        | typeof BadRequest
        | typeof Unauthorized
        | typeof Forbidden
        | typeof NotFound
        | typeof Conflict
        | typeof InternalServerError
      ),
      number,
    ]
  >(
    "Builds a ${value[0].name}",
    [
      [BadRequest, 400],
      [Unauthorized, 401],
      [Forbidden, 403],
      [NotFound, 404],
      [Conflict, 409],
      [InternalServerError, 500],
    ],
    ([fn, expectedStatus]) => {
      const message = faker.datatype.string();
      const err = new fn(new Error(message));

      expect(err).to.be.instanceOf(fn);
      expect(err)
        .to.have.property("message")
        .and.to.be.a("string")
        .and.to.equal(message);
      expect(err)
        .to.have.property("name")
        .and.to.be.a("string")
        .and.to.equal(fn.name);
      expect(err)
        .to.have.property("status")
        .and.to.be.a("number")
        .and.to.equal(expectedStatus);
    },
  );
});

describe("ErrorMiddleware", () => {
  let middleware: ErrorMiddleware;

  before(() => {
    middleware = new ErrorMiddleware();
  });

  it("falls to notFound - need mock objects for better test", () => {
    const req = {};
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;

    const result = middleware.notFound(req, res, next);

    return expect(result).to.eventually.be.undefined;
  });

  it("falls to handleError with an 'HttpError' - need mock objects for better test", () => {
    const message = "Missing property 'email'";
    const err = new BadRequest(new Error(message));
    const req = {};
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = middleware.handleError(err, req, res, next);

    expect(statusSpy.calledOnceWith(400)).to.be.true;
    expect(
      jsonSpy.calledOnceWith({
        message: "Missing property 'email'",
        status: 400,
        name: "BadRequest",
      }),
    ).to.be.true;

    return expect(result).to.eventually.be.undefined;
  });

  it("falls to handleError with an 'Error' - need mock objects for better test", () => {
    const message = "Uncaught error";
    const err = new Error(message);
    const req = {};
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = middleware.handleError(err, req, res, next);

    expect(statusSpy.calledOnceWith(500)).to.be.true;
    expect(
      jsonSpy.calledOnceWith({
        message: "Uncaught error",
        status: 500,
        name: "InternalServerError",
      }),
    ).to.be.true;

    return expect(result).to.eventually.be.undefined;
  });

  it("falls to handleError with a string - need mock objects for better test", () => {
    const message = "Uncaught string";
    const err = message;
    const req = {};
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = middleware.handleError(err, req, res, next);

    expect(statusSpy.calledOnceWith(500)).to.be.true;
    expect(
      jsonSpy.calledOnceWith({
        message: "Uncaught string",
        status: 500,
        name: "InternalServerError",
      }),
    ).to.be.true;

    return expect(result).to.eventually.be.undefined;
  });
});
