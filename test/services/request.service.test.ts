import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import sinon from "sinon";
import { OAuth2DatabaseClient } from "../../src/models";
import { RequestModel } from "../../src/models/request.model";
import { RequestService } from "../../src/services/request.service";

chai.use(chaiAsPromised);

describe("RequestService", () => {
  const { request: model } = new OAuth2DatabaseClient({});
  const service = new RequestService(model);
  let requestModelMock: sinon.SinonMock;
  let requestModelPrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    requestModelMock = sinon.mock(RequestModel);
    requestModelPrototypeMock = sinon.mock(RequestModel.prototype);
  });

  afterEach(() => {
    requestModelMock.restore();
    requestModelPrototypeMock.restore();
  });

  it("creates a request", () => {
    const payload = {
      resourceOwner: faker.datatype.uuid(),
      clientId: faker.datatype.uuid(),
      scope: faker.datatype.array().map((i) => i.toString()),
    };
    const mockRequest = new RequestModel(payload);

    requestModelMock
      .expects("create")
      .once()
      .withArgs(sinon.match(payload))
      .returns(mockRequest);

    const result = service.create(payload);

    requestModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(RequestModel)
      .and.to.satisfy((request: RequestModel) => request.equals(mockRequest))
      .and.to.have.property("code")
      .and.to.be.a("string")
      .and.to.match(/^[0-9a-f]+$/)
      .and.to.have.lengthOf(16);
  });
});
