import { Router } from "express";
import { OAuth2Controller } from "../controllers/oauth2.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { JSONSchemaType } from "ajv";

export class OAuth2Router {
  readonly router: Router;

  constructor(
    controller: OAuth2Controller,
    middleware: ValidationMiddleware,
    authMiddleware: AuthMiddleware,
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
        controller.authorize.bind(controller),
      );
    }

    {
      const bodySchema: JSONSchemaType<{
        client_id: string,
        client_secret: string,
        code: string,
        grant_type: string,
        redirect_uri: string
      }> = {
        type: "object",
        properties: {
          client_id: {
            type: "string",
            minLength: 1,
          },
          client_secret: {
            type: "string",
            minLength: 1,
          },
          code: {
            type: "string",
            minLength: 1,
          },
          grant_type: {
            type: "string",
            enum: ["authorization_code"],
          },
          redirect_uri: {
            type: "string",
            minLength: 1,
            format: "uri",
          },
        },
        required: ["client_id", "client_secret", "code", "grant_type", "redirect_uri"],
      };

      // Token
      this.router.post(
        "/token",
        middleware
          .validateRequest<
          {
            client_id: string,
            client_secret: string,
            code: string,
            grant_type: string,
            redirect_uri: string
          },
        unknown,
        unknown
          >({ bodySchema })
          .bind(middleware),
        controller.token.bind(controller),
      );
    }

    {
      // UserInfo
      this.router.get(
        "/userinfo",
        authMiddleware.authenticate.bind(authMiddleware),
        controller.info.bind(controller),
      );
    }
  }
}
