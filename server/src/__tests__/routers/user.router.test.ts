import { expect } from "chai";
import { UserController } from "../../controllers/user.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { PermissionMiddleware } from "../../middlewares/permission.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { UserRouter } from "../../routers/user.router.js";
import { expressMock } from "../helpers/mocks.helper.js";

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
    const authMiddleware = {
      authenticate: () => () => null,
    } as unknown as AuthMiddleware;
    const permissionMiddleware = {
      permitRequest: () => () => null,
    } as unknown as PermissionMiddleware;
    router = new UserRouter(
      controller,
      middleware,
      authMiddleware,
      permissionMiddleware,
    );
  });

  [
    { method: "POST", path: "/" },
    { method: "GET", path: "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" },
    { method: "PATCH", path: "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" },
    { method: "DELETE", path: "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" },
  ].forEach(({ method, path }) =>
    it(`ensures ${method} ${path} is present`, function () {
      const route = router.router.stack.find((s) => {
        if (s.route.path !== path) return false;
        if (!s.route.methods[method.toLowerCase()]) return false;

        return true;
      });

      expect(route).to.not.be.undefined;
    }));

  describe("isCurrentUserTargetted", () => {
    it("responds 'false' when current user and targetted user are not the same", () => {
      const express = expressMock({ params: { id: "id" }, locals: { user: "another_id" } });

      expect(UserRouter.isCurrentUserTargetted(express.req, express.res)).to.be.false;
    });

    it("responds 'true' when current user and targetted user are the same", () => {
      const express = expressMock({ params: { id: "id" }, locals: { user: "id" } });

      expect(UserRouter.isCurrentUserTargetted(express.req, express.res)).to.be.true;
    });
  });
});
