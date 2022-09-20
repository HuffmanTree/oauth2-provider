import { Logger } from "../logger";
import { UserModel } from "../models/user.model";

export class UserService {
  private _logger: Logger;

  private _model: typeof UserModel;

  constructor(model: typeof UserModel) {
    this._model = model;

    this._logger = new Logger({ service: "UserService" });
  }

  async create(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserModel> {
    const result = await this._model.create(payload);

    this._logger.info(result.toJSON(), "Created user");

    return result;
  }

  async findById(id: string): Promise<UserModel> {
    const result = await this._model.findByPk(id, { rejectOnEmpty: true });

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
      name: string;
      email: string;
      password: string;
    }>
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
