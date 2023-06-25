import {
  CreationOptional,
  DataTypes,
  Deferrable,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ProjectModel } from "./project.model";
import { UserModel } from "./user.model";

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
   * @description Temporary authorization code of the request
   *
   * @example "f862e77e46b6eab3"
   */
  declare code: string;

  /**
   * @description Temporary access token of the request
   *
   * @example "664ef0edf28c5d945aabb05403912734f3de841aa35ee09f76749c7ac67faac4f8806478afc143e4817f2a1c3fc7a92b84781e8e429f1d83f9643a6db92020d7"
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
          unique: "project_code",
        },
        scope: {
          comment: "Scope of the request",
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        code: {
          comment: "Temporary authorization code of the request",
          type: DataTypes.STRING,
          allowNull: false,
          unique: "project_code",
        },
        token: {
          comment: "Temporary access token of the request",
          type: DataTypes.STRING,
          allowNull: true,
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
      },
    );
  }
}
