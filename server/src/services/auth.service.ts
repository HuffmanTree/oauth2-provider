import fs from "fs";
import jwt from "jsonwebtoken";
import { Logger } from "../logger/index.js";
import { UserModel } from "../models/user.model.js";

export class AuthService {
  private _logger: Logger;

  private _privateKey: Buffer;

  private _publicKey: Buffer;

  private _signOptions?: jwt.SignOptions;

  private _verifyOptions?: jwt.VerifyOptions & { complete: false };

  constructor() {
    this._logger = new Logger({ service: "AuthService" });

    const config: {
      privateKey: Buffer;
      publicKey: Buffer;
      signOptions?: jwt.SignOptions;
      verifyOptions?: jwt.VerifyOptions & { complete: false };
    } = !process.env.NODE_ENV || ["ci", "env"].includes(process.env.NODE_ENV)
      ? {
        privateKey: Buffer.from("test.key"),
        publicKey: Buffer.from("test.key.pub"),
      }
      : {
        privateKey: fs.readFileSync(`${process.cwd()}/resources/keys/rsa.key`),
        publicKey: fs.readFileSync(`${process.cwd()}/resources/keys/rsa.key.pub`),
        signOptions: { algorithm: "RS256" },
        verifyOptions: {
          algorithms: ["RS256"],
          complete: false,
        },
      };

    this._privateKey = config.privateKey;

    this._publicKey = config.publicKey;

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
