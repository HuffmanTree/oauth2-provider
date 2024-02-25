import { JSONSchemaType } from "ajv";
import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger/index.js";
import { ValidationService } from "../services/validation.service.js";
import { unknownToError } from "../utils/index.js";
import { BadRequest } from "./error.middleware.js";

export class ValidationMiddleware {
  private _service: ValidationService;

  private _logger: Logger;

  constructor(service: ValidationService) {
    this._service = service;

    this._logger = new Logger({ service: "ValidationMiddleware" });
  }

  validateRequest<BodyType, QueryType, ParamsType>({
    bodySchema,
    querySchema,
    paramsSchema,
  }: Partial<{
    bodySchema: JSONSchemaType<BodyType>;
    querySchema: JSONSchemaType<QueryType>;
    paramsSchema: JSONSchemaType<ParamsType>;
  }>) {
    const logger = this._logger;
    const validator = this._service.validate.bind(this._service);

    async function callback(
      req: Request<ParamsType, unknown, BodyType, QueryType>,
      _res: Response,
      next: NextFunction,
    ): Promise<void> {
      const p: Array<Promise<BodyType | QueryType | ParamsType>> = [];

      if (bodySchema) p.push(validator(req.body, bodySchema));
      if (querySchema) p.push(validator(req.query, querySchema));
      if (paramsSchema) p.push(validator(req.params, paramsSchema));

      try {
        await Promise.all(p);

        return next();
      } catch (err) {
        logger.warn({}, "Request validation failed");

        const original = unknownToError(err);

        return next(new BadRequest(original));
      }
    }

    return callback;
  }
}
