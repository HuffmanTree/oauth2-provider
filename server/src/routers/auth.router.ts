import { JSONSchemaType } from "ajv";
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from "../middlewares/validation.middleware.js";

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
        controller.login.bind(controller),
      );
    }
  }
}
