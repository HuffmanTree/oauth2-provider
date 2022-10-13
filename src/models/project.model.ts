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

/**
 * @description Programmatic interface with the database project model
 *
 * @example
 * import { Sequelize } from "sequelize";
 *
 * const sequelize = new Sequelize();
 *
 * ProjectModel.initialize(sequelize);
 *
 * @category Model
 */
export class ProjectModel extends Model<
  InferAttributes<ProjectModel>,
  InferCreationAttributes<ProjectModel>
> {
  /**
   * @description Identifier of the project
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare id: CreationOptional<string>;

  /**
   * @description Hashed secret of the project
   *
   * @example "$2a$04$xJpe5CHncltnJsWIflNoGuFjeioy2ge35Mp6HycUoHa09/6EF6beO"
   */
  declare secret: string;

  /**
   * @description Full name of the project
   *
   * @example "My App"
   */
  declare name: string;

  /**
   * @description Redirection URL of the project
   *
   * @example "https://myapp.com"
   */
  declare redirectURL: string;

  /**
   * @description Scope of the project
   *
   * @example ["email", "name"]
   */
  declare scope: Array<string>;

  /**
   * @description Creator of the project
   *
   * @example "e4b71187-2294-4d75-b37f-77f94b013889"
   */
  declare creator: string;

  /**
   * @description Project entry creation date
   *
   * @example "2022-09-07T14:04:00Z"
   */
  declare createdAt: CreationOptional<string>;

  /**
   * @description Project entry last update
   *
   * @example "2022-09-07T14:32:00Z"
   */
  declare updatedAt: CreationOptional<string>;

  verifySecret(secret: string): boolean {
    return bcrypt.compareSync(secret, this.secret);
  }

  /**
   * @description Initializes the model
   *
   * @param {Sequelize} sequelize Sequelize instance to associate with the model
   *
   * @returns {typeof ProjectModel} Model static class
   *
   * @example
   * import { Sequelize } from "sequelize";
   *
   * const sequelize = new Sequelize();
   *
   * ProjectModel.initialize(sequelize);
   */
  static initialize(sequelize: Sequelize): typeof ProjectModel {
    return ProjectModel.init(
      {
        id: {
          comment: "Identifier of the project",
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        secret: {
          comment: "Hashed secret of the project",
          type: DataTypes.STRING,
          allowNull: false,
          set(value: string): void {
            this.setDataValue("secret", bcrypt.hashSync(value, 10));
          },
        },
        name: {
          comment: "Full name of the project",
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        redirectURL: {
          comment: "Redirection URL of the project",
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
          field: "redirect_url",
        },
        scope: {
          comment: "Scope of the project",
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        creator: {
          comment: "Creator of the project",
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: UserModel,
            key: "id",
            deferrable: Deferrable.INITIALLY_IMMEDIATE(),
          },
        },
        createdAt: {
          comment: "Project entry creation date",
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
        },
        updatedAt: {
          comment: "Project entry last update",
          type: DataTypes.DATE,
          allowNull: false,
          field: "updated_at",
        },
      },
      {
        sequelize,
        modelName: "project",
      }
    );
  }
}
