import { expect } from "chai";
import itParam from "mocha-param";
import { OAuth2Controller } from "../../src/controllers/oauth2.controller";
import { OAuth2Router } from "../../src/routers/oauth2.router";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";

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

  itParam(
    "ensures ${value[0]} ${value[1]} is present",
    [
      ["GET", "/authorize"],
      ["POST", "/token"],
      ["GET", "/userinfo"],
    ],
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
