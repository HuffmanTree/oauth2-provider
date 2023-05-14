import { NextFunction, Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { Logger } from "../logger";
import { RequestService } from "../services/request.service";
import { EmptyResultError } from "sequelize";
import { Forbidden } from "../middlewares/error.middleware";

type AuthorizeRequestQuery = {
  client_id: string,
  redirect_uri: string,
  response_type: string,
  scope: string
};

export class OAuth2Controller {
  private _logger: Logger;

  private _projectService: ProjectService;

  private _requestService: RequestService;

  constructor(projectService: ProjectService, requestService: RequestService) {
    this._projectService = projectService;

    this._requestService = requestService;

    this._logger = new Logger({ service: "OAuth2Controller" });
  }

  /**
   * @description Detects if error correspdonds to a forbidden scenario
   *
   * @param {unknown} err Error caught by `authorize` method
   *
   * @returns {boolean} Whether error should be translated to forbidden
   */
  private _isForbidden(err: unknown): boolean {
    if (err instanceof EmptyResultError) return true;

    if (err instanceof Error && err.message === "Disallowed request") return true;

    return false;
  }

  async authorize(
    req: Request<Record<string, string>, Record<string, string>, Record<string, string>, AuthorizeRequestQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { client_id: clientId, redirect_uri } = req.query;
      const scope = req.query.scope.split(",");
      const resourceOwner = res.locals.user;

      const project = await this._projectService.findById(clientId);

      if (!project.allowRequest(redirect_uri, scope)) {
        this._logger.debug({ project: project.id }, "Disallowed request");

        throw new Error("Disallowed request");
      }

      this._logger.info(
        { resourceOwner, clientId, scope },
        "Create operation payload"
      );

      const result = await this._requestService.create({
        resourceOwner,
        clientId,
        scope,
      });

      const url = `${redirect_uri}?code=${result.code}`;

      res.redirect(url);
    } catch (err) {
      if (this._isForbidden(err)) {
        const original = new Error("Project not allowed to request");

        return next(new Forbidden(original));
      }

      next(err);
    }
  }
}
