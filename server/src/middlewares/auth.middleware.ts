import { NextFunction, Request, Response } from "express";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { AuthService } from "../services/auth.service.js";
import { unknownToError } from "../utils/index.js";
import { Unauthorized } from "./error.middleware.js";

export class AuthMiddleware {
  private _logger: Logger;

  constructor(private readonly _service: AuthService) {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "AuthMiddleware",
      },
      transports: [new ConsoleTransport()],
    });
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
        this._logger.warn("Missing 'authorization' header");

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
            this._logger.warn("Authentication failed", { authorization, err });

            res.setHeader(
              "WWW-Authenticate",
              `Bearer invalid_token: ${unknownToError(err).message}`,
            );

            return next(new Unauthorized(original));
          }
        }
        default: {
          this._logger.warn(`Unknown scheme '${scheme}'`, { authorization });

          res.setHeader("WWW-Authenticate", "Bearer unknown_scheme");

          return next(new Unauthorized(original));
        }
      }
    };
  }
}
