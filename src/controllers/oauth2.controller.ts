import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger";
import { RequestService } from "../services/request.service";

type AuthorizeRequestQuery = {
  client_id: string,
  redirect_uri: string,
  response_type: string,
  scope: string
};

export class OAuth2Controller {
  private _logger: Logger;

  private _service: RequestService;

  constructor(service: RequestService) {
    this._service = service;

    this._logger = new Logger({ service: "OAuth2Controller" });
  }

  async authorize(
    req: Request<Record<string, string>, Record<string, string>, Record<string, string>, AuthorizeRequestQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { client_id: clientId, redirect_uri, scope } = req.query;
      const resourceOwner = res.locals.user;

      this._logger.info(
        { resourceOwner, clientId, scope },
        "Create operation payload"
      );

      const result = await this._service.create({
        resourceOwner,
        clientId,
        scope: scope.split(","),
      });

      const url = `${redirect_uri}?code=${result.code}`;

      res.redirect(url);
    } catch (err) {
      next(err);
    }
  }
}
