import { expect } from "chai";
import faker from "faker";
import itParam from "mocha-param";
import { UserController } from "../../src/controllers/user.controller";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";
import { PermissionMiddleware } from "../../src/middlewares/permission.middleware";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { UserRouter } from "../../src/routers/user.router";

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
    },
  );

  describe("isCurrentUserTargetted", () => {
    it("responds 'false' when current user and targetted user are not the same", () => {
      const current = faker.datatype.uuid();
      const target = faker.datatype.uuid();
      const req = { params: { id: target } };
      const res = { locals: { user: current } };

      expect(UserRouter.isCurrentUserTargetted(req, res)).to.be.false;
    });

    it("responds 'true' when current user and targetted user are the same", () => {
      const current = faker.datatype.uuid();
      const req = { params: { id: current } };
      const res = { locals: { user: current } };

      expect(UserRouter.isCurrentUserTargetted(req, res)).to.be.true;
    });
  });
});
