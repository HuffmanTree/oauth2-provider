import { OAuth2DatabaseClient } from "../../src/models";
import { RequestService } from "../../src/services/request.service";
import { OAuth2Controller } from "../../src/controllers/oauth2.controller";
import sinon from "sinon";
import chai, { expect } from "chai";
import faker from "faker";
import chaiAsPromised from "chai-as-promised";
import { RequestModel } from "../../src/models/request.model";

chai.use(chaiAsPromised);

describe("OAuth2Controller", () => {
  const { request: model } = new OAuth2DatabaseClient({});
  const service = new RequestService(model);
  const controller = new OAuth2Controller(service);
  let requestServicePrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    requestServicePrototypeMock = sinon.mock(RequestService.prototype);
  });

  afterEach(() => {
    requestServicePrototypeMock.restore();
  });

  it("computes an oauth2 authorization code", () => {
    const payload = {
      client_id: faker.datatype.uuid(),
      redirect_uri: faker.internet.url(),
      scope: faker.datatype.array().join(","),
    };
    const resourceOwner = faker.datatype.uuid();
    const req = { query: payload };
    const res = {
      redirect(url: string) {
        void url;
      },
      locals: { user: resourceOwner },
    };
    const next = () => undefined;
    const mockRequest = new RequestModel({
      clientId: payload.client_id,
      resourceOwner,
      scope: payload.scope.split(","),
    });

    requestServicePrototypeMock
      .expects("create")
      .once()
      .withArgs({
        clientId: payload.client_id,
        resourceOwner,
        scope: payload.scope.split(","),
      })
      .returns(mockRequest);

    const redirect = sinon.spy(res, "redirect");
    const nextSpy = sinon.spy(next);

    const result = controller.authorize(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(redirect.calledOnceWith(`${payload.redirect_uri}?code=${mockRequest.code}`)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      requestServicePrototypeMock.verify();

      return true;
    });
  });
});
