import { Request, Response, Router } from "express";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { UserController } from "../controllers/user.controller";
import { JSONSchemaType } from "ajv";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";

export class UserRouter {
  readonly router: Router;

  constructor(
    controller: UserController,
    middleware: ValidationMiddleware,
    authMiddleware: AuthMiddleware,
    permissionMiddleware: PermissionMiddleware,
  ) {
    this.router = Router();

    {
      const bodySchema: JSONSchemaType<{
        email: string;
        password: string;
        name: string;
      }> = {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            minLength: 1,
          },
          password: {
            type: "string",
            minLength: 1,
          },
          name: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["email", "password", "name"],
      };

      // CreateUser
      this.router.post(
        "/",
        middleware
          .validateRequest<
            { email: string; password: string; name: string },
            unknown,
            unknown
          >({ bodySchema })
          .bind(middleware),
        controller.create.bind(controller),
      );
    }

    {
      // GetUser
      this.router.get(
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        controller.find.bind(controller),
      );
    }

    {
      const bodySchema: JSONSchemaType<
        Partial<{
          email: string;
          password: string;
          name: string;
        }>
      > = {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            minLength: 1,
            nullable: true,
          },
          password: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
          name: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
        },
      };

      // UpdateUser
      this.router.patch(
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        authMiddleware.authenticate.bind(authMiddleware),
        permissionMiddleware
          .permitRequest(UserRouter.isCurrentUserTargetted)
          .bind(permissionMiddleware),
        middleware
          .validateRequest<
            Partial<{ email: string; password: string; name: string }>,
            unknown,
            unknown
          >({ bodySchema })
          .bind(middleware),
        controller.update.bind(controller),
      );
    }

    {
      // DestroyUser
      this.router.delete(
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        authMiddleware.authenticate.bind(authMiddleware),
        permissionMiddleware
          .permitRequest(UserRouter.isCurrentUserTargetted)
          .bind(permissionMiddleware),
        controller.destroy.bind(controller),
      );
    }
  }

  static isCurrentUserTargetted(req: Request, res: Response): boolean {
    return req.params.id === res.locals.user;
  }
}
