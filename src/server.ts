import { Server } from "http";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { Logger } from "./logger";
import { OAuth2DatabaseClient } from "./models";
import { AuthRouter } from "./routers/auth.router";
import { ValidationMiddleware } from "./middlewares/validation.middleware";
import { ValidationService } from "./services/validation.service";
import { AuthController } from "./controllers/auth.controller";
import { UserService } from "./services/user.service";
import { AuthService } from "./services/auth.service";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { UserController } from "./controllers/user.controller";
import { ProjectController } from "./controllers/project.controller";
import { ProjectRouter } from "./routers/project.router";
import { ProjectService } from "./services/project.service";
import { UserRouter } from "./routers/user.router";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { PermissionMiddleware } from "./middlewares/permission.middleware";

export namespace OAuth2Server {
  export interface Config {
    host: string;
    port: number;
  }
}

export class OAuth2Server {
  readonly app: Express;

  readonly database: OAuth2DatabaseClient;

  readonly host: string;

  private _logger: Logger;

  readonly port: number;

  private _server?: Server;

  constructor({ host, port }: Partial<OAuth2Server.Config>) {
    this.app = express();
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(cors());

    this.host = host || process.env.EXPRESS_HOST || "localhost";

    this.port =
      port ||
      (process.env.EXPRESS_PORT && parseInt(process.env.EXPRESS_PORT)) ||
      8080;

    this.database = new OAuth2DatabaseClient({});

    this._logger = new Logger({ service: "OAuth2Server" });

    /**
     * Initializes services
     */
    const validationService = new ValidationService();

    const userService = new UserService(this.database.user);

    const projectService = new ProjectService(this.database.project);

    const authService = new AuthService();

    /**
     * Initializes controllers
     */
    const userController = new UserController(userService);

    const authController = new AuthController(userService, authService);

    const projectController = new ProjectController(projectService);

    /**
     * Initializes middlewares
     */
    const authMiddleware = new AuthMiddleware(authService);

    const permissionMiddleware = new PermissionMiddleware();

    const validationMiddleware = new ValidationMiddleware(validationService);

    const errorMiddleware = new ErrorMiddleware();

    /**
     * Initializes routers
     */
    const authRouter = new AuthRouter(authController, validationMiddleware);

    const userRouter = new UserRouter(
      userController,
      validationMiddleware,
      authMiddleware,
      permissionMiddleware
    );

    const projectRouter = new ProjectRouter(
      projectController,
      validationMiddleware,
      authMiddleware
    );

    this.app.use("/api/auth", authRouter.router);
    this.app.use("/api/users", userRouter.router);
    this.app.use("/api/projects", projectRouter.router);
    this.app.use(errorMiddleware.notFound.bind(errorMiddleware));
    this.app.use(errorMiddleware.handleError.bind(errorMiddleware));
  }

  async start(): Promise<void> {
    await this.database.connect();

    this._server = this.app.listen(this.port, this.host, () => {
      const ctx = { host: this.host, port: this.port };

      this._logger.info(ctx, "Server is listening");

      process.on("SIGINT", this.stop.bind(this));
    });
  }

  async stop(): Promise<void> {
    await this.database.disconnect();

    if (!this._server) {
      this._logger.warn({}, "Server is not running");

      return;
    }

    this._server.close(() => {
      this._logger.info({}, "Server is closing");

      if (process.env.NODE_ENV !== "test") process.exit(0);
    });
  }
}
