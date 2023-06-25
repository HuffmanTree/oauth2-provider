import Ajv, { JSONSchemaType } from "ajv";
import { expect } from "chai";
import sinon from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { ValidationService } from "../../src/services/validation.service";
import { loggerMock } from "../helpers/mocks.helper";

const test = sinonTest(sinon);

describe("ValidationService", () => {
  let service: ValidationService;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    service = new ValidationService();
  }));

  describe("validates", () => {
    it("validates data against a schema", test(async function () {
      const compile = this.spy(Ajv.prototype, "compile");
      const schema: JSONSchemaType<string> = {
        type: "string",
      };

      const result = await service.validate("data", schema);

      expect(compile.calledOnceWith(schema)).to.be.true;
      expect(result).to.equal("data");
    }));

    it("fails to validate data against a schema", test(async function () {
      const compile = this.spy(Ajv.prototype, "compile");
      const schema: JSONSchemaType<string> = {
        type: "string",
      };

      const result = service.validate(42, schema);

      expect(compile.calledOnceWith(schema)).to.be.true;
      await result.then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
    }));
  });
});
