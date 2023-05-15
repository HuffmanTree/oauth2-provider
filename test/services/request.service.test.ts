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
    const mockRequest = new RequestModel({
      ...payload,
      code: faker.datatype.hexaDecimal(16).substring(2).toLowerCase(),
    });

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

  it("adds a token to a request", () => {
    const mockRequest = new RequestModel({
      resourceOwner: faker.datatype.uuid(),
      clientId: faker.datatype.uuid(),
      scope: faker.datatype.array().map((i) => i.toString()),
      code: faker.datatype.hexaDecimal(16).substring(2).toLowerCase(),
    });

    requestModelPrototypeMock
      .expects("update")
      .once()
      .withArgs("token", sinon.match(/^[0-9a-f]+$/))
      .returns(mockRequest);

    const result = service.token(mockRequest);

    requestModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(RequestModel)
      .and.to.satisfy((request: RequestModel) => request.equals(mockRequest))
      .and.to.have.property("token")
      .and.to.be.a("string")
      .and.to.match(/^[0-9a-f]+$/)
      .and.to.have.lengthOf(128);
  });

  it("finds a request from its client id and authorization code", () => {
    const clientId = faker.datatype.uuid();
    const code = faker.datatype.hexaDecimal(16).substring(2).toLowerCase();
    const mockRequest = new RequestModel({ clientId, code });

    requestModelMock
      .expects("findOne")
      .once()
      .withArgs(sinon.match({ where: { clientId, code } }))
      .returns(mockRequest);

    const result = service.findByClientIdAndCode({ clientId, code });

    requestModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(RequestModel)
      .and.to.satisfy((request: RequestModel) => (request.clientId === clientId) && (request.code === code));
  });
});
