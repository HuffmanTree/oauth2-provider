import { expect } from "chai";
import faker from "faker";
import itParam from "mocha-param";
import sinon from "sinon";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { ValidationService } from "../../src/services/validation.service";

describe("ValidationMiddleware", () => {
  let validationService: ValidationService;
  let middleware: ValidationMiddleware;
  let validationServicePrototypeMock: sinon.SinonMock;

  before(() => {
    validationService = new ValidationService();
    middleware = new ValidationMiddleware(validationService);
  });

  beforeEach(() => {
    validationServicePrototypeMock = sinon.mock(ValidationService.prototype);
  });

  afterEach(() => {
    validationServicePrototypeMock.restore();
  });

  itParam(
    "validates a request ${value}",
    ["body", "query", "params"],
    (value) => {
      const req = {
        [value]: {
          age: faker.datatype.number().toString(),
        },
      };
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

      validationServicePrototypeMock
        .expects("validate")
        .once()
        .withArgs(req[value])
        .resolves(req[value]);

      const result = middleware.validateRequest({
        [`${value}Schema`]: {
          type: "object",
          properties: {
            age: {
              type: "string",
            },
          },
          required: ["age"],
        },
      })(req, res, next);

      return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
        validationServicePrototypeMock.verify();

        return true;
      });
    },
  );

  it("fails to validate a request", () => {
    const req = {
      body: {
        age: faker.datatype.number().toString(),
      },
    };
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

    validationServicePrototypeMock
      .expects("validate")
      .once()
      .withArgs(req.body)
      .rejects("Validation failed");

    const result = middleware.validateRequest({
      bodySchema: {
        type: "object",
        properties: {
          age: {
            type: "string",
          },
        },
      },
    })(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      validationServicePrototypeMock.verify();

      return true;
    });
  });
});
