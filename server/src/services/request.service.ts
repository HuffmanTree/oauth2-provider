import { randomBytes } from "crypto";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError, Sequelize, Op } from "sequelize";
import { RequestModel } from "../models/request.model.js";
import { Scope } from "../models/user.model.js";

export class RequestService {
  private _logger: Logger;

  constructor(private readonly _model: typeof RequestModel) {
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
    scope: Array<Scope>;
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
      where: {
        ...payload,
        expiredAt: {
          [Op.gt]: Sequelize.fn("now"),
        },
      },
      rejectOnEmpty: new EmptyResultError("Request not found from token"),
    });

    this._logger.info("Found request", result.toJSON());

    return result;
  }

  async token(request: RequestModel): Promise<RequestModel> {
    const token = randomBytes(64).toString("base64");
    const expiredAt = Sequelize.literal("now() + interval '1' hour");

    const result = await request.update({ token, expiredAt });

    this._logger.info("Updated request", result.toJSON());

    return result;
  }
}
