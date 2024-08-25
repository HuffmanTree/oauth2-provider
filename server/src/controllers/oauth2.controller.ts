import { NextFunction, Request, Response } from "express";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError } from "sequelize";
import { Forbidden } from "../middlewares/error.middleware.js";
import { AuthService } from "../services/auth.service.js";
import { ProjectService } from "../services/project.service.js";
import { RequestService } from "../services/request.service.js";
import { UserService } from "../services/user.service.js";

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

  constructor(
    private readonly _projectService: ProjectService,
    private readonly _requestService: RequestService,
    private readonly _userService: UserService,
    private readonly _authService: AuthService,
  ) {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "OAuth2Controller",
      },
      transports: [new ConsoleTransport()],
    });
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
    req: Request<unknown, unknown, unknown, AuthorizeRequestQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { client_id: clientId, redirect_uri } = req.query;
      const scope = req.query.scope.split(",");
      const resourceOwner = res.locals.user;

      const project = await this._projectService.findById(clientId);

      if (!project.allowRequest(redirect_uri, scope)) {
        this._logger.debug("Disallowed request", { project: project.id });

        throw new Error("Disallowed request");
      }

      this._logger.info(
        "Create operation payload",
        { resourceOwner, clientId, scope },
      );

      const result = await this._requestService.create({
        resourceOwner,
        clientId,
        scope,
      });

      res.redirect(`${redirect_uri}?code=${result.code}`);
    } catch (err) {
      if (this._isForbidden(err)) {
        const original = new Error("Project not allowed to request");

        return next(new Forbidden(original));
      }

      next(err);
    }
  }

  async token(
    req: Request<unknown, TokenResponseBody, TokenRequestBody>,
    res: Response<TokenResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { client_id: clientId, client_secret: clientSecret, code } = req.body;

      const project = await this._projectService.findById(clientId);

      if (!project.verifySecret(clientSecret)) {
        this._logger.debug("Disallowed request", { project: project.id });

        throw new Error("Disallowed request");
      }

      const request = await this._requestService.findByClientIdAndCode({ clientId, code });

      if (request.token) {
        this._logger.debug("Disallowed request", { project: project.id });

        throw new Error("Disallowed request");
      }

      this._logger.info("Generating a token");

      const result = await this._requestService.token(request);

      const json: {
        access_token: string | null,
        token_type: string,
        expires_in: number,
        id_token?: string,
      } = {
        access_token: result.token,
        token_type: "Bearer",
        expires_in: 3600,
      };

      if (request.scope.includes("openid")) {
        const user = await this._userService.findById(request.resourceOwner, request.scope.filter(scope => scope !== "openid"));

        json.id_token = await this._authService.login(user, { skipPasswordVerification: true });
      }

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
    _req: Request<unknown, unknown>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = res.locals.token;
      const request = await this._requestService.findByToken({ token });
      const user = await this._userService.findById(request.resourceOwner, request.scope.filter(scope => scope !== "openid"));

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
