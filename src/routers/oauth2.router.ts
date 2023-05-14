import { Router } from "express";
import { OAuth2Controller } from "../controllers/oauth2.controller";
import { ValidationMiddleware } from "src/middlewares/validation.middleware";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { JSONSchemaType } from "ajv";

export class OAuth2Router {
  readonly router: Router;

  constructor(
    controller: OAuth2Controller,
    middleware: ValidationMiddleware,
    authMiddleware: AuthMiddleware
  ) {
    this.router = Router();

    {
      const querySchema: JSONSchemaType<{
        response_type: string,
        client_id: string,
        redirect_uri: string,
        scope: string,
      }> = {
        type: "object",
        properties: {
          response_type: {
            type: "string",
            enum: ["code"],
          },
          client_id: {
            type: "string",
            minLength: 1,
          },
          redirect_uri: {
            type: "string",
            minLength: 1,
            format: "uri",
          },
          scope: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["response_type", "client_id", "redirect_uri", "scope"],
      };

      // Authorize
      this.router.get(
        "/authorize",
        authMiddleware.authenticate.bind(authMiddleware),
        middleware
          .validateRequest<
          unknown,
        {
            response_type: string,
            client_id: string,
            redirect_uri: string,
            scope: string,
          },
        unknown
          >({ querySchema })
          .bind(middleware),
        controller.authorize.bind(controller)
      );
    }
  }
}
