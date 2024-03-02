import { randomBytes } from "crypto";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError } from "sequelize";
import { RequestModel } from "../models/request.model.js";

export class RequestService {
  private _logger: Logger;

  private _model: typeof RequestModel;

  constructor(model: typeof RequestModel) {
    this._model = model;

    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "RequestService",
      },
      transports: [new ConsoleTransport()],
    });
  }

  async create(payload: {
    resourceOwner: string;
    clientId: string;
    scope: Array<string>;
  }): Promise<RequestModel> {
    const code = randomBytes(8).toString("hex");

    const result = await this._model.create({ ...payload, code });

    this._logger.info("Created request", result.toJSON());

    return result;
  }

  async findByClientIdAndCode(payload: {
    clientId: string,
    code: string
  }): Promise<RequestModel> {
    const result = await this._model.findOne({
      where: payload,
      rejectOnEmpty: new EmptyResultError(`Request not found for project: '${payload.clientId}'`),
    });

    this._logger.info("Found request", result.toJSON());

    return result;
  }

  async findByToken(payload: {
    token: string
  }): Promise<RequestModel> {
    const result = await this._model.findOne({
      where: payload,
      rejectOnEmpty: new EmptyResultError("Request not found from token"),
    });

    this._logger.info("Found request", result.toJSON());

    return result;
  }

  async token(request: RequestModel): Promise<RequestModel> {
    const token = randomBytes(64).toString("base64");

    const result = await request.update({ token });

    this._logger.info("Updated request", result.toJSON());

    return result;
  }
}
