import { expect } from "chai";
import { AuthController } from "../../controllers/auth.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthRouter } from "../../routers/auth.router.js";

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
        if (!s.route || s.route.path !== path) return false;
        if (!(method.toLowerCase() in s.route)) return false;

        return true;
      });

      expect(route).to.not.be.undefined;
    }));
});
