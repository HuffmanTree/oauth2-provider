import { JSONSchemaType } from "ajv";
import { Request, Response, Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { ValidationMiddleware } from "../middlewares/validation.middleware";

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
        givenName: string;
        familyName: string;
        picture: string;
        phoneNumber?: string;
        birthdate: string;
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
          givenName: {
            type: "string",
            minLength: 1,
          },
          familyName: {
            type: "string",
            minLength: 1,
          },
          picture: {
            type: "string",
            format: "uri",
            minLength: 1,
          },
          phoneNumber: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
          birthdate: {
            type: "string",
            format: "date",
            minLength: 1,
          },
        },
        required: ["email", "password", "givenName", "familyName", "picture", "birthdate"],
      };

      // CreateUser
      this.router.post(
        "/",
        middleware
          .validateRequest<
          { email: string; password: string; givenName: string; familyName: string, picture: string; phoneNumber?: string; birthdate: string },
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
          givenName: string;
          familyName: string;
          picture: string;
          phoneNumber: string;
          birthdate: string;
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
          givenName: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
          familyName: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
          picture: {
            type: "string",
            format: "uri",
            minLength: 1,
            nullable: true,
          },
          phoneNumber: {
            type: "string",
            minLength: 1,
            nullable: true,
          },
          birthdate: {
            type: "string",
            format: "date",
            minLength: 1,
            nullable: true,
          },
        },
      };

      // UpdateUser
      this.router.patch(
        "/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        authMiddleware.authenticate.bind(authMiddleware, true),
        permissionMiddleware
          .permitRequest(UserRouter.isCurrentUserTargetted)
          .bind(permissionMiddleware),
        middleware
          .validateRequest<
          Partial<{ email: string; password: string; givenName: string; familyName: string; picture: string; phoneNumber?: string; birthdate: string }>,
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
        authMiddleware.authenticate.bind(authMiddleware, true),
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
