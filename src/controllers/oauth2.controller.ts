import { NextFunction, Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { Logger } from "../logger";
import { RequestService } from "../services/request.service";
import { EmptyResultError } from "sequelize";
import { Forbidden } from "../middlewares/error.middleware";
import { UserService } from "../services/user.service";

type AuthorizeRequestQuery = {
  client_id: string,
  redirect_uri: string,
  response_type: string,
  scope: string
};

type TokenRequestBody = {
  client_id: string,
  client_secret: string,
  code: string,
  grant_type: string,
  redirect_uri: string,
};

type TokenResponseBody = {
  access_token: string | null,
  token_type: string,
};

export class OAuth2Controller {
  private _logger: Logger;

  private _projectService: ProjectService;

  private _requestService: RequestService;

  private _userService: UserService;

  constructor(
    projectService: ProjectService,
    requestService: RequestService,
    userService: UserService,
  ) {
    this._projectService = projectService;

    this._requestService = requestService;

    this._userService = userService;

    this._logger = new Logger({ service: "OAuth2Controller" });
  }

  /**
   * @description Detects if error correspdonds to a forbidden scenario
   *
   * @param {unknown} err Error caught by `authorize`, `token` and `info` method
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
    next: NextFunction,
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
        "Create operation payload",
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

  async token(
    req: Request<Record<string, string>, TokenResponseBody, TokenRequestBody>,
    res: Response<TokenResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { client_id: clientId, client_secret: clientSecret, code } = req.body;

      const request = await this._requestService.findByClientIdAndCode({ clientId, code });
      const project = await this._projectService.findById(clientId);

      if (!project.verifySecret(clientSecret)) {
        this._logger.debug({ project: project.id }, "Disallowed request");

        throw new Error("Disallowed request");
      }

      this._logger.info({}, "Generating a token");

      const result = await this._requestService.token(request);

      const json = {
	access_token: result.token,
        token_type: "Bearer",
      };

      res.status(200).json(json);
    } catch (err) {
      if (this._isForbidden(err)) {
        const original = new Error("Project not allowed to request");

        return next(new Forbidden(original));
      }

      next(err);
    }
  }

  async info(
    req: Request<Record<string, string>, Record<string, string>>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = res.locals.access;
      const request = await this._requestService.findByToken({ token });
      const user = await this._userService.findById(request.resourceOwner, request.scope);

      const json = user.toJSON();

      res.status(200).json(json);
    } catch (err) {
      if (this._isForbidden(err)) {
        const original = new Error("Project not allowed to request");

        return next(new Forbidden(original));
      }

      next(err);
    }
  }
}
