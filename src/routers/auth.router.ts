import { Router } from "express";
import { ValidationMiddleware } from "src/middlewares/validation.middleware";
import { AuthController } from "../controllers/auth.controller";
import { JSONSchemaType } from "ajv";

export class AuthRouter {
  readonly router: Router;

  constructor(controller: AuthController, middleware: ValidationMiddleware) {
    this.router = Router();

    {
      const bodySchema: JSONSchemaType<{ email: string; password: string }> = {
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
        },
        required: ["email", "password"],
      };

      // Login
      this.router.post(
        "/login",
        middleware
          .validateRequest<
            { email: string; password: string },
            unknown,
            unknown
          >({ bodySchema })
          .bind(middleware),
        controller.login.bind(controller)
      );
    }
  }
}
