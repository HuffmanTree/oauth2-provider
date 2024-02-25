import { Sequelize } from "sequelize";
import { Logger } from "../logger/index.js";
import { ProjectModel } from "./project.model.js";
import { RequestModel } from "./request.model.js";
import { UserModel } from "./user.model.js";

/**
 * @description Namespace associated with {@link OAuth2DatabaseClient}
 */
export namespace OAuth2DatabaseClient {
  /**
   * @description Configuration to partially pass to the constructor
   */
  export interface Config {
    /**
     * @description Name of the database targetted by the client
     *
     * @example "oauth2"
     */
    database: string;
    /**
     * @description Hostname of the database targetted by the client
     *
     * @example "localhost"
     */
    host: string;
    /**
     * @description Password to use during connection
     *
     * @example "secret"
     */
    password: string;
    /**
     * @description Port of the database targetted by the client
     *
     * @example 5432
     */
    port: number;
    /**
     * @description Username to use during connection
     *
     * @example "postgres"
     */
    username: string;
  }
}

/**
 * @description Client wrapping multiple database models
 *
 * @example
 * const config = {
 *   database: "oauth2",
 *   username: "postgres",
 *   host: "localhost",
 *   port: 5432
 * };
 * const client = new OAuth2DatabaseClient(config);
 *
 * await client.connect();
 *
 * const users = await client.user.findAll();
 * console.log("Number of users", users.length);
 *
 * await client.disconnect();
 */
export class OAuth2DatabaseClient {
  /**
   * @description Name of the database targetted by the client
   *
   * @example "oauth2"
   */
  private _database: string;

  /**
   * @description Hostname of the database targetted by the client
   *
   * @example "localhost"
   */
  private _host: string;

  private _logger: Logger;

  /**
   * @description Port of the database targetted by the client
   *
   * @example 5432
   */
  private _port: number;

  readonly sequelize: Sequelize;

  /**
   * @description User connected by the client
   *
   * @example "postgres"
   */
  private _username: string;

  /**
   * @description Build an instance of `OAuth2DatabaseClient`
   *
   * @param {OAuth2DatabaseClient.Config} config Configuration to use for the client
   */
  constructor({
    database,
    host,
    password,
    port,
    username,
  }: Partial<OAuth2DatabaseClient.Config>) {
    this._database = database || process.env.SEQUELIZE_DATABASE || "postgres";

    this._host = host || process.env.SEQUELIZE_HOST || "localhost";

    this._port =
      port ||
      (process.env.SEQUELIZE_PORT && parseInt(process.env.SEQUELIZE_PORT)) ||
      5432;

    this._username = username || process.env.SEQUELIZE_USERNAME || "postgres";

    this._logger = new Logger({ service: "OAuth2DatabaseClient" });

    this.sequelize = new Sequelize({
      database: this._database,
      dialect: "postgres",
      host: this._host,
      password: password || process.env.SEQUELIZE_PASSWORD,
      port: this._port,
      username: this._username,
      logging: this._logger.trace.bind(this._logger, {
        database: this._database,
        host: this._host,
        port: this._port,
        username: this._username,
      }),
    });

    UserModel.initialize(this.sequelize);

    ProjectModel.initialize(this.sequelize);

    RequestModel.initialize(this.sequelize);

    this._logger.info({}, "Initialized models");
  }

  /**
   * @description Connect the client to the database
   *
   * @example
   * client
   *  .connect()
   *  .then(() => console.log("Client connected"))
   *  .catch((err: Error) => console.error("Error while connecting to the database:" + err.message));
   */
  async connect(): Promise<void> {
    await this.sequelize.sync({
      force: process.env.NODE_ENV === "development",
    });

    const ctx = {
      database: this._database,
      host: this._host,
      port: this._port,
      username: this._username,
    };

    this._logger.info(ctx, "Client is connected to database");
  }

  /**
   * @description Disconnect the client from the database
   *
   * @example
   * client
   *  .disconnect()
   *  .then(() => console.log("Client disconnected"))
   *  .catch((err: Error) => console.error("Error while disconnecting from the database:" + err.message));
   */
  async disconnect(): Promise<void> {
    await this.sequelize.close();

    this._logger.info({}, "Client is closing");
  }

  /**
   * @description Associated `UserModel` static instance
   */
  get user(): typeof UserModel {
    return UserModel;
  }

  /**
   * @description Associated `ProjectModel` static instance
   */
  get project(): typeof ProjectModel {
    return ProjectModel;
  }

  /**
   * @description Associated `RequestModel` static instance
   */
  get request(): typeof RequestModel {
    return RequestModel;
  }
}
