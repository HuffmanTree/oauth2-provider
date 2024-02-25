import { EmptyResultError } from "sequelize";
import { Logger } from "../logger/index.js";
import { UserModel } from "../models/user.model.js";

export class UserService {
  private _logger: Logger;

  private _model: typeof UserModel;

  constructor(model: typeof UserModel) {
    this._model = model;

    this._logger = new Logger({ service: "UserService" });
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

    this._logger.info(result.toJSON(), "Created user");

    return result;
  }

  async findById(id: string, attributes?: string[]): Promise<UserModel> {
    const result = await this._model.findByPk(id, {
      attributes,
      rejectOnEmpty: new EmptyResultError(`User not found: '${id}'`),
    });

    this._logger.info(result.toJSON(), "Found user");

    return result;
  }

  async findByEmail(email: string): Promise<UserModel> {
    const result = await this._model.findOne({
      rejectOnEmpty: true,
      where: { email },
    });

    this._logger.info(result.toJSON(), "Found user");

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

    this._logger.info(result.toJSON(), "Updated user");

    return result;
  }

  async destroy(user: UserModel): Promise<void> {
    await user.destroy();

    this._logger.info(user.toJSON(), "Destroyed user");
  }
}
