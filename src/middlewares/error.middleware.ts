import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger";
import { unknownToError } from "../utils";

class HttpError extends Error {
  constructor(readonly status: number, readonly name: string, original: Error) {
    super(original.message);

    this.stack = original.stack;
  }
}

export class BadRequest extends HttpError {
  constructor(original: Error) {
    super(400, BadRequest.name, original);
  }
}

export class Unauthorized extends HttpError {
  constructor(original: Error) {
    super(401, Unauthorized.name, original);
  }
}

export class Forbidden extends HttpError {
  constructor(original: Error) {
    super(403, Forbidden.name, original);
  }
}

export class NotFound extends HttpError {
  constructor(original: Error) {
    super(404, NotFound.name, original);
  }
}

export class Conflict extends HttpError {
  constructor(original: Error) {
    super(409, Conflict.name, original);
  }
}

export class InternalServerError extends HttpError {
  constructor(original: Error) {
    super(500, InternalServerError.name, original);
  }
}

export class ErrorMiddleware {
  private _logger: Logger;

  constructor() {
    this._logger = new Logger({ service: "ErrorMiddleware" });
  }

  async notFound(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const original = new Error(`Path not found: '${req.path}'`);

    next(new NotFound(original));
  }

  async handleError(
    err: unknown,
    _req: Request,
    res: Response,
    /**
     * @todo 03-10-2022 - It is important to declare a `NextFunction`
     * parameter so express treats this method as a
     * `̀ErrorRequestHandler` and does not skip it. Forcing the type
     * may help removing the eslint rule exception.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ): Promise<void> {
    this._logger.error({ err }, "Raw error");

    const httpError =
      err instanceof HttpError
        ? err
        : new InternalServerError(unknownToError(err));

    const json: {
      message: string;
      status: number;
      name: string;
      stack?: string;
    } = {
      message: httpError.message,
      status: httpError.status,
      name: httpError.name,
    };

    if (process.env.NODE_ENV === "development") json.stack = httpError.stack;

    this._logger.error({ json }, "HTTP error");

    res.status(json.status).json(json);
  }
}
