import Ajv, { JSONSchemaType } from "ajv";
import addFormat from "ajv-formats";
import { Logger } from "js-logger";
import { LoggerLevel } from "js-logger/levels";
import { ConsoleTransport } from "js-logger/transports";

export class ValidationService {
  private _logger: Logger;

  private _ajv: Ajv.default;

  constructor() {
    this._logger = new Logger({
      includeTimestamp: true,
      maxLevel: LoggerLevel.DEBUG,
      metadata: {
        service: "ValidationService",
      },
      transports: [new ConsoleTransport()],
    });

    this._ajv = addFormat.default(new Ajv.default());
  }

  async validate<T>(data: unknown, schema: JSONSchemaType<T>): Promise<T> {
    const validate = this._ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors;

      this._logger.warn(
        "Data not valid against JSON schema",
        { data, schema, errors },
      );

      throw new Error(this._ajv.errorsText(errors));
    }

    return data;
  }
}
