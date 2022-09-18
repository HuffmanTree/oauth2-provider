import { NextFunction, Request, Response } from "express";
import { InferAttributes } from "sequelize/types";
import { Logger } from "../logger";
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

  async create(
    req: Request<
      Record<string, undefined>,
      CreateResponseBody,
      CreateRequestBody
    >,
    res: Response<CreateResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, password } = req.body;

      this._logger.info({ email, name }, "Create operation payload");

      const result = await this._service.create({ email, name, password });
      const { password: _, ...json } = result.toJSON();

      res.status(201).json(json);
    } catch (err) {
      next(err);
    }
  }

  async find(
    req: Request<FindParams, FindResponseBody>,
    res: Response<FindResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      this._logger.info({ id }, "Find operation payload");

      const result = await this._service.findById(id);
      const { password: _, ...json } = result.toJSON();

      res.status(200).json(json);
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: Request<UpdateParams, UpdateResponseBody, UpdateRequestBody>,
    res: Response<UpdateResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { email, name, password } = req.body;

      this._logger.info({ id, email, name }, "Update operation payload");

      const user = await this._service.findById(id);
      const result = await this._service.update(user, {
        email,
        name,
        password,
      });
      const { password: _, ...json } = result.toJSON();

      res.status(200).json(json);
    } catch (err) {
      next(err);
    }
  }

  async destroy(
    req: Request<DestroyParams, DestroyResponseBody>,
    res: Response<DestroyResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      this._logger.info({ id }, "Destroy operation payload");

      const user = await this._service.findById(id);
      await this._service.destroy(user);
      const json = { deleted: id };

      res.status(200).json(json);
    } catch (err) {
      next(err);
    }
  }
}
