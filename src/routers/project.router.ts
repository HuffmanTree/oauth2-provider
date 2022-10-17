import { JSONSchemaType } from "ajv";
import { Router } from "express";
import { ValidationMiddleware } from "src/middlewares/validation.middleware";
import { ProjectController } from "../controllers/project.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class ProjectRouter {
  readonly router: Router;

  constructor(
    controller: ProjectController,
    middleware: ValidationMiddleware,
    authMiddleware: AuthMiddleware
  ) {
    this.router = Router();

    {
      const bodySchema: JSONSchemaType<{
        name: string;
        redirectURL: string;
        scope: Array<string>;
      }> = {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
          },
          redirectURL: {
            type: "string",
            minLength: 1,
            format: "uri",
          },
          scope: {
            type: "array",
            minItems: 1,
            items: {
              type: "string",
              minLength: 1,
            },
          },
        },
        required: ["name", "redirectURL", "scope"],
      };

      // CreateProject
      this.router.post(
        "/",
        authMiddleware.authenticate.bind(authMiddleware),
        middleware
          .validateRequest<
            { name: string; redirectURL: string; scope: Array<string> },
            unknown,
            unknown
          >({ bodySchema })
          .bind(middleware),
        controller.create.bind(controller)
      );
    }

    {
      // GetProject
      this.router.get(
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        controller.find.bind(controller)
      );
    }
  }
}
