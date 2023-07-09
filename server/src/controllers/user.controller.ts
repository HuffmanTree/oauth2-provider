import { NextFunction, Request, Response } from "express";
import {
  EmptyResultError,
  InferAttributes,
  UniqueConstraintError,
} from "sequelize";
import { Logger } from "../logger";
import { Conflict, NotFound } from "../middlewares/error.middleware";
import { UserModel } from "../models/user.model";
import { UserService } from "../services/user.service";

type CreateRequestBody = Omit<
  InferAttributes<UserModel>,
  "id" | "createdAt" | "updatedAt"
>;

type CreateResponseBody = Omit<InferAttributes<UserModel>, "password">;

type FindParams = { id: string };

type FindResponseBody = Omit<InferAttributes<UserModel>, "password">;

type UpdateParams = { id: string };

type UpdateRequestBody = Partial<
  Omit<InferAttributes<UserModel>, "id" | "createdAt" | "updatedAt">
>;

type UpdateResponseBody = Omit<InferAttributes<UserModel>, "password">;

type DestroyParams = { id: string };

type DestroyResponseBody = { deleted: string };

export class UserController {
  private _logger: Logger;

  private _service: UserService;

  constructor(service: UserService) {
    this._service = service;

    this._logger = new Logger({ service: "UserController" });
  }

  /**
   * @description Detects if error correspdonds to a conflict scenario
   *
   * @param {unknown} err Error caught by `create` and `update` methods
   *
   * @returns {boolean} Whether error should be translated to conflict
   */
  private _isConflict(err: unknown): err is UniqueConstraintError {
    if (err instanceof UniqueConstraintError) return true;

    return false;
  }

  /**
   * @description Detects if error correspdonds to a not found scenario
   *
   * @param {unknown} err Error caught by `find`, `update` and `destroy` methods
   *
   * @returns {boolean} Whether error should be translated to not found
   */
  private _isNotFound(err: unknown): err is EmptyResultError {
    if (err instanceof EmptyResultError) return true;

    return false;
  }

  async create(
    req: Request<unknown, CreateResponseBody, CreateRequestBody>,
    res: Response<CreateResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        email,
        givenName,
        familyName,
        password,
        picture,
        phoneNumber,
        birthdate,
      } = req.body;

      this._logger.info({ email, givenName, familyName, picture, phoneNumber, birthdate }, "Create operation payload");

      const result = await this._service.create({ email, givenName, familyName, picture, phoneNumber, birthdate, password });
      const { password: _, ...json } = result.toJSON();

      /**
       * - `req.baseUrl` - path the user controller is mounted on -> `/api/users`
       * - `req.path` - path the create method is mounted on -> `/`
       */
      res.setHeader("Location", `${req.baseUrl}${req.path}${json.id}`);
      res.status(201).json(json);
    } catch (err) {
      if (this._isConflict(err)) {
        const original = new Error(err.errors[0].message);

        return next(new Conflict(original));
      }

      next(err);
    }
  }

  async find(
    req: Request<FindParams, FindResponseBody>,
    res: Response<FindResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      this._logger.info({ id }, "Find operation payload");

      const result = await this._service.findById(id);
      const { password: _, ...json } = result.toJSON();

      res.status(200).json(json);
    } catch (err) {
      if (this._isNotFound(err)) {
        const original = err;

        return next(new NotFound(original));
      }

      next(err);
    }
  }

  async update(
    req: Request<UpdateParams, UpdateResponseBody, UpdateRequestBody>,
    res: Response<UpdateResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { email, givenName, familyName, picture, phoneNumber, birthdate, password } = req.body;

      this._logger.info({ id, email, givenName, familyName, picture, phoneNumber, birthdate }, "Update operation payload");

      const user = await this._service.findById(id);
      const result = await this._service.update(user, {
        email,
        givenName,
        familyName,
        picture,
        phoneNumber,
        birthdate,
        password,
      });
      const { password: _, ...json } = result.toJSON();

      res.status(200).json(json);
    } catch (err) {
      if (this._isNotFound(err)) {
        const original = err;

        return next(new NotFound(original));
      }

      if (this._isConflict(err)) {
        const original = new Error(err.errors[0].message);

        return next(new Conflict(original));
      }

      next(err);
    }
  }

  async destroy(
    req: Request<DestroyParams, DestroyResponseBody>,
    res: Response<DestroyResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      this._logger.info({ id }, "Destroy operation payload");

      const user = await this._service.findById(id);
      await this._service.destroy(user);
      const json = { deleted: user.id };

      res.status(200).json(json);
    } catch (err) {
      if (this._isNotFound(err)) {
        const original = err;

        return next(new NotFound(original));
      }

      next(err);
    }
  }
}
