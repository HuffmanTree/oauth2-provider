import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger";
import { AuthService } from "../services/auth.service";

export class AuthMiddleware {
  private _service: AuthService;

  private _logger: Logger;

  constructor(service: AuthService) {
    this._service = service;

    this._logger = new Logger({ service: "AuthMiddleware" });
  }

  async authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    const authorization = req.headers.authorization;

    if (!authorization) {
      this._logger.warn({}, "Missing 'authotization' header");

      return next(new Error("Missing 'authotization' header"));
    }

    const [scheme, token] = authorization.split(" ");

    switch (scheme) {
      case "Bearer": {
        try {
          await this._service.verify(token);
        } catch (err) {
          this._logger.warn({ authorization }, "Authentication failed");

          return next(err);
        }

        break;
      }
      default: {
        this._logger.warn({ authorization }, `Unknown scheme '${scheme}'`);

        return next(new Error(`Unknown scheme '${scheme}'`));
      }
    }
  }
}
