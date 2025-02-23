import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError } from "sequelize";
import { UserModel } from "../models/user.model.js";

export class UserService {
  private _logger: Logger;

  constructor(private readonly _model: typeof UserModel) {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "UserService",
      },
      transports: [new ConsoleTransport()],
    });
  }

  async create(payload: {
    givenName: string;
    familyName: string;
    picture: string;
    phoneNumber?: string;
    birthdate: string;
    gender: string;
    email: string;
    password: string;
  }): Promise<UserModel> {
    const result = await this._model.create(payload);

    this._logger.info("Created user", result.toJSON());

    return result;
  }

  async findById(id: string, attributes?: Array<string>): Promise<UserModel> {
    const result = await this._model.findByPk(id, {
      attributes,
      rejectOnEmpty: new EmptyResultError(`User not found: '${id}'`),
    });

    this._logger.info("Found user", result.toJSON() );

    return result;
  }

  async findByEmail(email: string): Promise<UserModel> {
    const result = await this._model.findOne({
      rejectOnEmpty: true,
      where: { email },
    });

    this._logger.info("Found user", result.toJSON());

    return result;
  }

  async update(
    user: UserModel,
    payload: Partial<{
      givenName: string;
      familyName: string;
      picture: string;
      phoneNumber: string;
      birthdate: string;
      gender: string;
      email: string;
      password: string;
    }>,
  ): Promise<UserModel> {
    const result = await user.update(payload);

    this._logger.info("Updated user", result.toJSON());

    return result;
  }

  async destroy(user: UserModel): Promise<void> {
    await user.destroy();

    this._logger.info("Destroyed user", user.toJSON());
  }
}
