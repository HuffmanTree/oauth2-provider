import bcrypt from "bcrypt";
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

/**
 * @description Programmatic interface with the database user model
 *
 * @example
 * import { Sequelize } from "sequelize";
 *
 * const sequelize = new Sequelize();
 *
 * UserModel.initialize(sequelize);
 *
 * @category Model
 */
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  /**
   * @description Identifier of the user
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare id: CreationOptional<string>;

  /**
   * @description Email of the user
   *
   * @example "jane.doe@yopmail.fr"
   */
  declare email: string;

  /**
   * @description Hashed password of the user
   *
   * @example "$2a$04$xJpe5CHncltnJsWIflNoGuFjeioy2ge35Mp6HycUoHa09/6EF6beO"
   */
  declare password: string;

  /**
   * @description Full name of the user
   *
   * @example "Jane Doe"
   */
  declare name: string;

  /**
   * @description User entry creation date
   *
   * @example "2022-09-07T14:04:00Z"
   */
  declare createdAt: CreationOptional<string>;

  /**
   * @description User entry last update
   *
   * @example "2022-09-07T14:32:00Z"
   */
  declare updatedAt: CreationOptional<string>;

  /**
   * @description Initializes the model
   *
   * @param {Sequelize} sequelize Sequelize instance to associate with the model
   *
   * @returns {typeof UserModel} Model static class
   *
   * @example
   * import { Sequelize } from "sequelize";
   *
   * const sequelize = new Sequelize();
   *
   * UserModel.initialize(sequelize);
   */
  static initialize(sequelize: Sequelize): typeof UserModel {
    return UserModel.init(
      {
        id: {
          comment: "Identifier of the user",
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        email: {
          comment: "Email of the user",
          type: DataTypes.STRING,
          unique: true,
          validate: {
            isEmail: true,
          },
          allowNull: false,
        },
        password: {
          comment: "Hashed password of the user",
          type: DataTypes.STRING,
          allowNull: false,
          set(value: string): void {
            this.setDataValue("password", bcrypt.hashSync(value, 10));
          },
        },
        name: {
          comment: "Full name of the user",
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        createdAt: {
          comment: "User entry creation date",
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
        },
        updatedAt: {
          comment: "User entry last update",
          type: DataTypes.DATE,
          allowNull: false,
          field: "updated_at",
        },
      },
      {
        sequelize,
        modelName: "user",
      }
    );
  }
}
