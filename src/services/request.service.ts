import { Logger } from "../logger";
import { RequestModel } from "../models/request.model";
import { randomBytes } from "crypto";

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
}
