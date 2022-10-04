import { expect } from "chai";
import itParam from "mocha-param";
import { UserController } from "../../src/controllers/user.controller";
import { UserRouter } from "../../src/routers/user.router";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";

describe("UserRouter", () => {
  let router: UserRouter;

  before(() => {
    const controller = {
      create: () => null,
      find: () => null,
      update: () => null,
      destroy: () => null,
    } as unknown as UserController;
    const middleware = {
      validateRequest: () => () => null,
    } as unknown as ValidationMiddleware;
    router = new UserRouter(controller, middleware);
  });

  itParam(
    "ensures ${value[0]} ${value[1]} is present",
    [
      ["POST", "/"],
      [
        "GET",
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
      ],
      [
        "PATCH",
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
      ],
      [
        "DELETE",
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
      ],
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
