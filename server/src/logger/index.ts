import winston from "winston";
import { AbstractConfigSetLevels } from "winston/lib/winston/config";

declare module "winston" {
  export interface Logger {
    fatal: winston.LeveledLogMethod;
    trace: winston.LeveledLogMethod;
  }
}

export class Logger {
  static LOG_LEVELS: AbstractConfigSetLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  };

  private _logger: winston.Logger;

  constructor(metadata: { service: string } & Record<string, unknown>) {
    this._logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
      level: process.env.WINSTON_LEVEL || "info",
      levels: Logger.LOG_LEVELS,
      defaultMeta: metadata,
      silent: ["ci", "test"].includes(String(process.env.NODE_ENV)),
    });
  }

  fatal(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).fatal(message);
  }

  error(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).error(message);
  }

  warn(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).warn(message);
  }

  info(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).info(message);
  }

  debug(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).debug(message);
  }

  trace(context: Record<string, unknown>, message: string): void {
    this._logger.child({ context }).trace(message);
  }
}
