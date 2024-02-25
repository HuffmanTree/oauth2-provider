import Ajv, { JSONSchemaType } from "ajv";
import addFormat from "ajv-formats";
import { Logger } from "../logger/index.js";

export class ValidationService {
  private _logger: Logger;

  private _ajv: Ajv.default;

  constructor() {
    this._logger = new Logger({ service: "ValidationService" });

    this._ajv = addFormat.default(new Ajv.default());
  }

  async validate<T>(data: unknown, schema: JSONSchemaType<T>): Promise<T> {
    const validate = this._ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors;

      this._logger.warn(
        { data, schema, errors },
        "Data not valid against JSON schema",
      );

      throw new Error(this._ajv.errorsText(errors));
    }

    return data;
  }
}
