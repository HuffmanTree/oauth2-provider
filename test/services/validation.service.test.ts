import Ajv from "ajv";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import sinon from "sinon";
import { ValidationService } from "../../src/services/validation.service";

chai.use(chaiAsPromised);

describe("ValidationService", () => {
  let service: ValidationService;
  let ajvMock: sinon.SinonMock;

  before(() => {
    service = new ValidationService();
  });

  beforeEach(() => {
    ajvMock = sinon.mock(Ajv.prototype);
  });

  afterEach(() => {
    ajvMock.restore();
  });

  it("validates data against a schema", () => {
    const data = faker.datatype.string();
    const schema = {
      type: "string",
    };

    ajvMock
      .expects("compile")
      .once()
      .withArgs(schema)
      .returns(() => true);

    const result = service.validate(data, schema);

    return expect(result).to.eventually.equal(data);
  });

  it("fails to validate data against a schema", () => {
    const data = faker.datatype.number();
    const schema = {
      type: "string",
    };

    ajvMock
      .expects("compile")
      .once()
      .withArgs(schema)
      .returns(() => false);

    const result = service.validate(data, schema);

    return expect(result).to.eventually.be.rejected;
  });
});
