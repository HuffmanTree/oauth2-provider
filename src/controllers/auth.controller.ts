import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { Logger } from "../logger";
import { UserService } from "../services/user.service";

type LoginRequestBody = { email: string; password: string };

type LoginResponseBody = { message: string; token: string };

export class AuthController {
  private _logger: Logger;

  private _authService: AuthService;

  private _userService: UserService;

  constructor(userService: UserService, authService: AuthService) {
    this._userService = userService;

    this._authService = authService;

    this._logger = new Logger({ service: "AuthController" });
  }

  async login(
    req: Request<
      Record<string, undefined>,
      LoginResponseBody,
      LoginRequestBody
    >,
    res: Response<LoginResponseBody>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      this._logger.info({ email }, "Login operation payload");

      const user = await this._userService.findByEmail(email);
      const token = await this._authService.login(user, password);
      const message = `Logged in as ${user.id}`;
      const json = { message, token };

      res.status(200).json(json);
    } catch (err) {
      next(err);
    }
  }
}
