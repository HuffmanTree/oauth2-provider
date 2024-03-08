import { Server } from "http";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { AuthController } from "./controllers/auth.controller.js";
import { OAuth2Controller } from "./controllers/oauth2.controller.js";
import { ProjectController } from "./controllers/project.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { ErrorMiddleware } from "./middlewares/error.middleware.js";
import { PermissionMiddleware } from "./middlewares/permission.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { OAuth2DatabaseClient } from "./models/index.js";
import { AuthRouter } from "./routers/auth.router.js";
import { OAuth2Router } from "./routers/oauth2.router.js";
import { ProjectRouter } from "./routers/project.router.js";
import { UserRouter } from "./routers/user.router.js";
import { AuthService } from "./services/auth.service.js";
import { ProjectService } from "./services/project.service.js";
import { RequestService } from "./services/request.service.js";
import { UserService } from "./services/user.service.js";
import { ValidationService } from "./services/validation.service.js";

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

  constructor({ host, port }: Partial<OAuth2Server.Config> = {}) {
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

    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "OAuth2Server",
      },
      transports: [new ConsoleTransport()],
    });

    /**
     * Initializes services
     */
    const validationService = new ValidationService();

    const userService = new UserService(this.database.user);

    const projectService = new ProjectService(this.database.project);

    const requestService = new RequestService(this.database.request);

    const authService = new AuthService();

    /**
     * Initializes controllers
     */
    const userController = new UserController(userService);

    const authController = new AuthController(userService, authService);

    const projectController = new ProjectController(projectService);

    const oauth2Controller = new OAuth2Controller(projectService, requestService, userService, authService);

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
      permissionMiddleware,
    );

    const projectRouter = new ProjectRouter(
      projectController,
      validationMiddleware,
      authMiddleware,
    );

    const oauth2Router = new OAuth2Router(
      oauth2Controller,
      validationMiddleware,
      authMiddleware,
    );

    this.app.use((req, res, next) => {
      this._logger.info(`${req.method.toUpperCase()} ${req.url}`, {
        headers: req.headers,
        body: req.body,
      });

      next();
    });

    this.app.use("/api/auth", authRouter.router);
    this.app.use("/api/users", userRouter.router);
    this.app.use("/api/projects", projectRouter.router);
    this.app.use("/api/oauth2", oauth2Router.router);
    this.app.use(errorMiddleware.notFound.bind(errorMiddleware));
    this.app.use(errorMiddleware.handleError.bind(errorMiddleware));
  }

  async start(): Promise<void> {
    await this.database.connect();

    this._server = this.app.listen(this.port, this.host, () => {
      this._logger.info("Server is listening", { host: this.host, port: this.port });

      process.on("SIGINT", this.stop.bind(this));
    });
  }

  async stop(): Promise<void> {
    await this.database.disconnect();

    if (!this._server) {
      this._logger.warn("Server is not running");

      return;
    }

    this._server.close(() => {
      this._logger.info("Server is closing");

      if (!["ci", "test"].includes(String(process.env.NODE_ENV)))
        process.exit(0);
    });
  }
}
