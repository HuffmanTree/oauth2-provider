import { NextFunction, Request, Response } from "express";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";
import { EmptyResultError } from "sequelize";
import { Unauthorized } from "../middlewares/error.middleware.js";
import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";

type LoginRequestBody = { email: string; password: string };

type LoginResponseBody = { message: string; token: string };

export class AuthController {
  private _logger: Logger;

  constructor(private readonly _userService: UserService, private readonly _authService: AuthService) {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "AuthController",
      },
      transports: [new ConsoleTransport()],
    });
  }

  /**
   * @description Detects if error correspdonds to an unauthorized scenario
   *
   * @param {unknown} err Error caught by `login` method
   *
   * @returns {boolean} Whether error should be translated to unauthorized
   */
  private _isUnauthorized(err: unknown): boolean {
    if (err instanceof EmptyResultError) return true;

    if (err instanceof Error && err.message === "Invalid password") return true;

    return false;
  }

  async login(
    req: Request<unknown, LoginResponseBody, LoginRequestBody>,
    res: Response<LoginResponseBody>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      this._logger.info("Login operation payload", { email });

      const user = await this._userService.findByEmail(email);
      const token = await this._authService.login(user, password);
      const message = `Logged in as ${user.id}`;
      const json = { message, token };

      res.status(200).json(json);
    } catch (err) {
      if (this._isUnauthorized(err)) {
        const original = new Error("Invalid email or password");

        return next(new Unauthorized(original));
      }

      next(err);
    }
  }
}
