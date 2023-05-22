import { expect } from "chai";
import itParam from "mocha-param";
import { ProjectController } from "../../src/controllers/project.controller";
import { ProjectRouter } from "../../src/routers/project.router";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";

describe("ProjectRouter", () => {
  let router: ProjectRouter;

  before(() => {
    const controller = {
      create: () => null,
      find: () => null,
    } as unknown as ProjectController;
    const middleware = {
      validateRequest: () => () => null,
    } as unknown as ValidationMiddleware;
    const authMiddleware = {
      authenticate: () => () => null,
    } as unknown as AuthMiddleware;
    router = new ProjectRouter(controller, middleware, authMiddleware);
  });

  itParam(
    "ensures ${value[0]} ${value[1]} is present",
    [
      ["POST", "/"],
      [
        "GET",
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
});
