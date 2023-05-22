import fs from "fs";
import jwt from "jsonwebtoken";
import { Logger } from "../logger";
import { UserModel } from "../models/user.model";

export class AuthService {
  private _logger: Logger;

  private _privateKey: Buffer;

  private _publicKey: Buffer;

  private _signOptions?: jwt.SignOptions;

  private _verifyOptions?: jwt.VerifyOptions & { complete: false };

  static config: Record<
    string,
    {
      privateKeyFile: string;
      publicKeyFile: string;
      signOptions?: jwt.SignOptions;
      verifyOptions?: jwt.VerifyOptions & { complete: false };
    }
  > = {
    test: {
      privateKeyFile: "/tmp/test.key",
      publicKeyFile: "/tmp/test.key.pub",
    },
    ci: {
      privateKeyFile: "/tmp/test.key",
      publicKeyFile: "/tmp/test.key.pub",
    },
    development: {
      privateKeyFile: `${process.cwd()}/resources/keys/rsa.key`,
      publicKeyFile: `${process.cwd()}/resources/keys/rsa.key.pub`,
      signOptions: { algorithm: "RS256" },
      verifyOptions: {
        algorithms: ["RS256"],
        complete: false,
      },
    },
  };

  constructor() {
    this._logger = new Logger({ service: "AuthService" });

    const config = AuthService.config[process.env.NODE_ENV || "test"];

    this._privateKey = fs.readFileSync(config.privateKeyFile);

    this._publicKey = fs.readFileSync(config.publicKeyFile);

    this._signOptions = config.signOptions;

    this._verifyOptions = config.verifyOptions;
  }

  async login(user: UserModel, password: string): Promise<string> {
    if (!user.verifyPassword(password)) {
      this._logger.debug({ user: user.id }, "Invalid password");

      throw new Error("Invalid password");
    }

    const { password: _, createdAt, updatedAt, ...payload } = user.toJSON();
    const token = jwt.sign(payload, this._privateKey, this._signOptions);

    this._logger.info({ token }, "Built token");

    return token;
  }

  async verify(token: string): Promise<string> {
    const payload = jwt.verify(token, this._publicKey, this._verifyOptions);

    if (typeof payload === "string") {
      this._logger.warn(
        { payload },
        "Not expecting JWT payload to be a string",
      );

      return payload;
    }

    this._logger.info({ payload }, "Authenticated token");

    return payload.id;
  }
}
