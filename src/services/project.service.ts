import { randomBytes } from "crypto";
import { EmptyResultError } from "sequelize";
import { Logger } from "../logger";
import { ProjectModel } from "../models/project.model";

export class ProjectService {
  private _logger: Logger;

  private _model: typeof ProjectModel;

  constructor(model: typeof ProjectModel) {
    this._model = model;

    this._logger = new Logger({ service: "ProjectService" });
  }

  async create(payload: {
    name: string;
    redirectURL: string;
    scope: Array<string>;
    creator: string;
  }): Promise<ProjectModel> {
    const secret = randomBytes(32).toString("hex");

    const result = await this._model.create({ ...payload, secret });

    this._logger.info(result.toJSON(), "Created project");

    /**
     * We need the app secret to be displayed after creation
     */
    result.setDataValue("secret", secret);

    return result;
  }

  async findById(id: string): Promise<ProjectModel> {
    const result = await this._model.findByPk(id, {
      rejectOnEmpty: new EmptyResultError(`Project not found: '${id}'`),
    });

    this._logger.info(result.toJSON(), "Found project");

    return result;
  }
}
