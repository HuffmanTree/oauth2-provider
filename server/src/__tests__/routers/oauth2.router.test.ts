import { expect } from "chai";
import { OAuth2Controller } from "../../controllers/oauth2.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { OAuth2Router } from "../../routers/oauth2.router.js";

describe("OAuth2Router", () => {
  let router: OAuth2Router;

  before(() => {
    const controller = {
      authorize: () => null,
      token: () => null,
      info: () => null,
    } as unknown as OAuth2Controller;
    const middleware = {
      validateRequest: () => () => null,
    } as unknown as ValidationMiddleware;
    const authMiddleware = {
      authenticate: () => () => null,
    } as unknown as AuthMiddleware;
    router = new OAuth2Router(controller, middleware, authMiddleware);
  });

  [
    { method: "GET", path: "/authorize" },
    { method: "POST", path: "/token" },
    { method: "GET", path: "/userinfo" },
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
