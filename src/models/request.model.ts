import bcrypt from "bcrypt";
import {
  CreationOptional,
  DataTypes,
  Deferrable,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { UserModel } from "./user.model";
import { ProjectModel } from "./project.model";

/**
 * @description Programmatic interface with the database request model
 *
 * @example
 * import { Sequelize } from "sequelize";
 *
 * const sequelize = new Sequelize();
 *
 * RequestModel.initialize(sequelize);
 *
 * @category Model
 */
export class RequestModel extends Model<
  InferAttributes<RequestModel>,
  InferCreationAttributes<RequestModel>
> {
  /**
   * @description Identifier of the request
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare id: CreationOptional<string>;
  
  /**
   * @description Resource owner
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare resourceOwner: string;
  
  /**
   * @description Project id
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare clientId: string;

  /**
   * @description Scope of the request
   *
   * @example ["email", "name"]
   */
  declare scope: Array<string>;
  
  /**
   * @description Hashed authorization code of the request
   *
   * @example "$2a$04$xJpe5CHncltnJsWIflNoGuFjeioy2ge35Mp6HycUoHa09/6EF6beO"
   */
  declare code: string;

  /**
   * @description Hashed access token of the request
   *
   * @example "$2a$04$xJpe5CHncltnJsWIflNoGuFjeioy2ge35Mp6HycUoHa09/6EF6beO"
   */
  declare token: string | null;

  /**
   * @description Request access token expiration date
   *
   * @example "2022-09-07T14:04:00Z"
   */
  declare expiredAt: CreationOptional<string> | null;

  /**
   * @description Request entry creation date
   *
   * @example "2022-09-07T14:04:00Z"
   */
  declare createdAt: CreationOptional<string>;

  /**
   * @description Request entry last update
   *
   * @example "2022-09-07T14:32:00Z"
   */
  declare updatedAt: CreationOptional<string>;

  /**
   * @description Initializes the model
   *
   * @param {Sequelize} sequelize Sequelize instance to associate with the model
   *
   * @returns {typeof RequestModel} Model static class
   *
   * @example
   * import { Sequelize } from "sequelize";
   *
   * const sequelize = new Sequelize();
   *
   * RequestModel.initialize(sequelize);
   */
  static initialize(sequelize: Sequelize): typeof RequestModel {
    return RequestModel.init(
      {
	id: {
          comment: "Identifier of the request",
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        resourceOwner: {
          comment: "User associated with the request",
          type: DataTypes.UUID,
          allowNull: false,
          field: "resource_owner",
          references: {
            model: UserModel,
            key: "id",
            deferrable: Deferrable.INITIALLY_IMMEDIATE(),
          },
        },
        clientId: {
          comment: "Project associated with the request",
          type: DataTypes.UUID,
          allowNull: false,
          field: "client_id",
          references: {
            model: ProjectModel,
            key: "id",
            deferrable: Deferrable.INITIALLY_IMMEDIATE(),
          },
        },
	scope: {
          comment: "Scope of the request",
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        code: {
          comment: "Hashed authorization code of the request",
          type: DataTypes.STRING,
          allowNull: false,
          set(value: string): void {
            this.setDataValue("code", bcrypt.hashSync(value, 10));
          },
        },
        token: {
          comment: "Hashed access token of the request",
          type: DataTypes.STRING,
          allowNull: true,
          set(value?: string): void {
            if (value) this.setDataValue("token", bcrypt.hashSync(value, 10));
          },
        },
        expiredAt: {
          comment: "Request access token expiration date",
          type: DataTypes.DATE,
          allowNull: true,
          field: "expired_at",
        },
        createdAt: {
          comment: "Request entry creation date",
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
        },
        updatedAt: {
          comment: "Request entry last update",
          type: DataTypes.DATE,
          allowNull: false,
          field: "updated_at",
        },
      },
      {
        sequelize,
        modelName: "request",
      }
    );
  }
}
