import { randomBytes } from "crypto";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError } from "sequelize";
import { ProjectModel } from "../models/project.model.js";
import { Scope } from "../models/user.model.js";

export class ProjectService {
  private _logger: Logger;

  constructor(private readonly _model: typeof ProjectModel) {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "ProjectService",
      },
      transports: [new ConsoleTransport()],
    });
  }

  async create(payload: {
    name: string;
    redirectURL: string;
    scope: Array<Scope>;
    creator: string;
  }): Promise<ProjectModel> {
    const secret = randomBytes(32).toString("hex");

    const result = await this._model.create({ ...payload, secret });

    this._logger.info("Created project", result.toJSON());

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

    this._logger.info("Found project", result.toJSON());

    return result;
  }
}
