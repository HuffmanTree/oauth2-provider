import { NextFunction, Request, Response } from "express";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { Forbidden } from "./error.middleware.js";

export class PermissionMiddleware {
  private _logger: Logger;

  constructor() {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "PermissionMiddleware",
      },
      transports: [new ConsoleTransport()],
    });
  }

  permitRequest(permissionFunction: (req: Request, res: Response) => boolean) {
    const logger = this._logger;

    async function callback(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      if (permissionFunction(req, res)) return next();

      logger.warn("Action not allowed");

      const original = new Error("Not allowed to perform this action");

      return next(new Forbidden(original));
    }

    return callback;
  }
}
