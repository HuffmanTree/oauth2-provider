import { NextFunction, Request, Response } from "express";
import {
  EmptyResultError,
  InferAttributes,
  UniqueConstraintError,
} from "sequelize";
import { Logger } from "../logger";
import { ProjectModel } from "../models/project.model";
import { ProjectService } from "../services/project.service";
import { Conflict, NotFound } from "../middlewares/error.middleware";

type CreateRequestBody = Omit<
  InferAttributes<ProjectModel>,
  "id" | "secret" | "creator" | "createdAt" | "updatedAt"
>;

type CreateResponseBody = InferAttributes<ProjectModel>;

type FindParams = { id: string };

type FindResponseBody = Omit<InferAttributes<ProjectModel>, "secret">;

export class ProjectController {
  private _logger: Logger;

  private _service: ProjectService;

  constructor(service: ProjectService) {
    this._service = service;

    this._logger = new Logger({ service: "ProjectController" });
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
    req: Request<Record<string, string>, CreateResponseBody, CreateRequestBody>,
    res: Response<CreateResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, redirectURL, scope } = req.body;
      const creator = res.locals.user;

      this._logger.info(
        { name, redirectURL, scope, creator },
        "Create operation payload"
      );

      const result = await this._service.create({
        name,
        redirectURL,
        scope,
        creator,
      });
      const json = result.toJSON();

      /**
       * - `req.baseUrl` - path the project controller is mounted on -> `/api/projects`
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
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      this._logger.info({ id }, "Find operation payload");

      const result = await this._service.findById(id);
      const { secret: _, ...json } = result.toJSON();

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
