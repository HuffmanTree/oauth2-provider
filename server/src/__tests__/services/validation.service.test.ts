import { JSONSchemaType } from "ajv";
import { expect } from "chai";
import { ValidationService } from "../../services/validation.service.js";

describe("ValidationService", () => {
  let service: ValidationService;

  before(function () {
    service = new ValidationService();
  });

  describe("validates", () => {
    it("validates data against a schema", async function () {
      const schema: JSONSchemaType<string> = {
        type: "string",
      };

      const result = await service.validate("data", schema);

      expect(result).to.equal("data");
    });

    it("fails to validate data against a schema", async function () {
      const schema: JSONSchemaType<string> = {
        type: "string",
      };

      const result = service.validate(42, schema);

      await result.then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
    });
  });
});
