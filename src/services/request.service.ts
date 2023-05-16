import { Logger } from "../logger";
import { RequestModel } from "../models/request.model";
import { randomBytes } from "crypto";
import { EmptyResultError } from "sequelize";

export class RequestService {
  private _logger: Logger;

  private _model: typeof RequestModel;

  constructor(model: typeof RequestModel) {
    this._model = model;

    this._logger = new Logger({ service: "RequestService" });
  }

  async create(payload: {
    resourceOwner: string;
    clientId: string;
    scope: Array<string>;
  }): Promise<RequestModel> {
    const code = randomBytes(8).toString("hex");

    const result = await this._model.create({ ...payload, code });

    this._logger.info(result.toJSON(), "Created request");

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

    this._logger.info(result.toJSON(), "Found request");

    return result;
  }

  async token(request: RequestModel): Promise<RequestModel> {
    const token = randomBytes(64).toString("hex");

    const result = await request.update({ token });

    this._logger.info(result.toJSON(), "Updated request");

    return result;
  }
}
