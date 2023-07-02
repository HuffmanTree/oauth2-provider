import { expect } from "chai";
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

  [
    { method: "POST", path: "/login" },
  ].forEach(({ method, path }) =>
    it(`ensures ${method} ${path} is present`, function () {
      const route = router.router.stack.find((s) => {
        if (s.route.path !== path) return false;
        if (!s.route.methods[method.toLowerCase()]) return false;

        return true;
      });

      expect(route).to.not.be.undefined;
    }));
});
