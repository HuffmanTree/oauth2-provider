import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger/index.js";
import { AuthService } from "../services/auth.service.js";
import { unknownToError } from "../utils/index.js";
import { Unauthorized } from "./error.middleware.js";

export class AuthMiddleware {
  private _service: AuthService;

  private _logger: Logger;

  constructor(service: AuthService) {
    this._service = service;

    this._logger = new Logger({ service: "AuthMiddleware" });
  }

  authenticate(jwt: boolean) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const original = new Error("Check 'WWW-Authenticate' header");
      const authorization = req.headers.authorization;

      if (!authorization) {
        this._logger.warn({}, "Missing 'authorization' header");

        res.setHeader("WWW-Authenticate", "Bearer missing_token");

        return next(new Unauthorized(original));
      }

      const [scheme, token] = authorization.split(" ");

      switch (scheme) {
        case "Bearer": {
          try {
            res.locals.token = token;

            if (jwt) res.locals.user = await this._service.verify(token);

            return next();
          } catch (err) {
            this._logger.warn({ authorization, err }, "Authentication failed");

            res.setHeader(
              "WWW-Authenticate",
              `Bearer invalid_token: ${unknownToError(err).message}`,
            );

            return next(new Unauthorized(original));
          }
        }
        default: {
          this._logger.warn({ authorization }, `Unknown scheme '${scheme}'`);

          res.setHeader("WWW-Authenticate", "Bearer unknown_scheme");

          return next(new Unauthorized(original));
        }
      }
    };
  }
}
