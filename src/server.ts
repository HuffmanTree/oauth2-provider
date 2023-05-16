import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { Server } from "http";
import path from "path";
import { AuthController } from "./controllers/auth.controller";
import { OAuth2Controller } from "./controllers/oauth2.controller";
import { ProjectController } from "./controllers/project.controller";
import { UserController } from "./controllers/user.controller";
import { Logger } from "./logger";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { PermissionMiddleware } from "./middlewares/permission.middleware";
import { ValidationMiddleware } from "./middlewares/validation.middleware";
import { OAuth2DatabaseClient } from "./models";
import { AuthRouter } from "./routers/auth.router";
import { OAuth2Router } from "./routers/oauth2.router";
import { ProjectRouter } from "./routers/project.router";
import { UserRouter } from "./routers/user.router";
import { AuthService } from "./services/auth.service";
import { ProjectService } from "./services/project.service";
import { RequestService } from "./services/request.service";
import { UserService } from "./services/user.service";
import { ValidationService } from "./services/validation.service";

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
    this.app.use("/static", express.static(path.join(process.cwd(), "static")));

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

    const requestService = new RequestService(this.database.request);

    const authService = new AuthService();

    /**
     * Initializes controllers
     */
    const userController = new UserController(userService);

    const authController = new AuthController(userService, authService);

    const projectController = new ProjectController(projectService);

    const oauth2Controller = new OAuth2Controller(projectService, requestService, userService);

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

    const oauth2Router = new OAuth2Router(
      oauth2Controller,
      validationMiddleware,
      authMiddleware
    );


    this.app.use((req, res, next) => {
      this._logger.info({
	headers: req.headers,
	body: req.body,
      }, `${req.method.toUpperCase()} ${req.url}`);

      next();
    });

    this.app.use("/api/auth", authRouter.router);
    this.app.use("/api/users", userRouter.router);
    this.app.use("/api/projects", projectRouter.router);
    this.app.use("/api/oauth2/", oauth2Router.router);
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

      if (!["ci", "test"].includes(String(process.env.NODE_ENV)))
        process.exit(0);
    });
  }
}
