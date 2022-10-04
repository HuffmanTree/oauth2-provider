import { expect } from "chai";
import itParam from "mocha-param";
import { AuthController } from "../../src/controllers/auth.controller";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { AuthRouter } from "../../src/routers/auth.router";

describe("AuthRouter", () => {
  let router: AuthRouter;

  before(() => {
    const controller = { login: () => null } as unknown as AuthController;
    const middleware = {
      validateRequest: () => () => null,
    } as unknown as ValidationMiddleware;
    router = new AuthRouter(controller, middleware);
  });

  itParam(
    "ensures ${value[0]} ${value[1]} is present",
    [["POST", "/login"]],
    ([method, path]) => {
      const route = router.router.stack.find((s) => {
        if (s.route.path !== path) return false;
        if (!s.route.methods[method.toLowerCase()]) return false;

        return true;
      });

      expect(route).to.not.be.undefined;
    }
  );
});
