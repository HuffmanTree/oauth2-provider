import { expect } from "chai";
import itParam from "mocha-param";
import { PermissionMiddleware } from "../../src/middlewares/permission.middleware";

describe("PermissionMiddleware", () => {
  let middleware: PermissionMiddleware;

  before(() => {
    middleware = new PermissionMiddleware();
  });

  itParam<[string, boolean]>(
    "${value[0]} the request when permission function returns ${value[1]}",
    [
      ["allows", true],
      ["disallows", false],
    ],
    (value) => {
      const f = () => value[1];
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

      const result = middleware.permitRequest(f)(req, res, next);

      return expect(result).to.eventually.be.undefined;
    },
  );
});
