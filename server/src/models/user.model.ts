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
   * @description Given name of the user
   *
   * @example "Jane"
   */
  declare givenName: string;

  /**
   * @description Family name of the user
   *
   * @example "Doe"
   */
  declare familyName: string;

  /**
   * @description URL to the picture of the user
   *
   * @example "https://domain.com/me.png"
   */
  declare picture: string;

  /**
   * @description Phone number of the user
   *
   * @example "+33123456789"
   */
  declare phoneNumber?: string;

  /**
   * @description Date of birth of the user
   *
   * @example "2000-09-07"
   */
  declare birthdate: string;

  /**
   * @description Gender of the user
   *
   * @example "male"
   */
  declare gender: string;

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

  verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

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
        givenName: {
          comment: "Given name of the user",
          type: DataTypes.STRING,
          allowNull: false,
          field: "given_name",
        },
        familyName: {
          comment: "Family name of the user",
          type: DataTypes.STRING,
          allowNull: false,
          field: "family_name",
        },
        picture: {
          comment: "URL to the picture of the user",
          type: DataTypes.STRING,
          allowNull: false,
        },
        phoneNumber: {
          comment: "Phone number of the user",
          type: DataTypes.STRING,
          allowNull: true,
          field: "phone_number",
        },
        birthdate: {
          comment: "Date of birth of the user",
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        gender: {
          comment: "Gender of the user",
          type: DataTypes.ENUM("female", "male"),
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
      },
    );
  }
}
