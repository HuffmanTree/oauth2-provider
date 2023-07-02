import { expect } from "chai";
import { ProjectController } from "../../src/controllers/project.controller";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";
import { ValidationMiddleware } from "../../src/middlewares/validation.middleware";
import { ProjectRouter } from "../../src/routers/project.router";

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

  [
    { method: "POST", path: "/" },
    { method: "GET", path: "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" },
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
