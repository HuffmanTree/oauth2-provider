import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import { EmptyResultError } from "sequelize";
import sinon from "sinon";
import { OAuth2Controller } from "../../src/controllers/oauth2.controller";
import { OAuth2DatabaseClient } from "../../src/models";
import { ProjectModel } from "../../src/models/project.model";
import { RequestModel } from "../../src/models/request.model";
import { ProjectService } from "../../src/services/project.service";
import { RequestService } from "../../src/services/request.service";

chai.use(chaiAsPromised);

describe("OAuth2Controller", () => {
  const { request: model, project: projectModel } = new OAuth2DatabaseClient({});
  const projectService = new ProjectService(projectModel);
  const requestService = new RequestService(model);
  const controller = new OAuth2Controller(projectService, requestService);
  let projectServicePrototypeMock: sinon.SinonMock;
  let requestServicePrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    projectServicePrototypeMock = sinon.mock(ProjectService.prototype);
    requestServicePrototypeMock = sinon.mock(RequestService.prototype);
  });

  afterEach(() => {
    projectServicePrototypeMock.restore();
    requestServicePrototypeMock.restore();
  });

  it("computes an oauth2 authorization code", () => {
    const clientId = faker.datatype.uuid();
    const redirectURI = faker.internet.url();
    const scope = faker.datatype.array().map((i) => i.toString()).filter((i) => !i.includes(","));
    const payload = {
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scope.join(","),
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
    const mockProject = new ProjectModel({ id: clientId, redirectURL: redirectURI, scope });
    const mockRequest = new RequestModel({
      clientId: payload.client_id,
      resourceOwner,
      scope: payload.scope.split(","),
    });

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(clientId)
      .returns(mockProject);
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

      projectServicePrototypeMock.verify();
      requestServicePrototypeMock.verify();

      return true;
    });
  });

  it("fails to compute an authorization code with an invalid client id", () => {
    const clientId = faker.datatype.uuid();
    const redirectURI = faker.internet.url();
    const scope = faker.datatype.array().map((i) => i.toString()).filter((i) => !i.includes(","));
    const payload = {
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scope.join(","),
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

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(clientId)
      .throws(new EmptyResultError(""));
    requestServicePrototypeMock.expects("create").never();

    const redirect = sinon.spy(res, "redirect");

    const result = controller.authorize(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(redirect.notCalled).to.be.true;

      projectServicePrototypeMock.verify();
      requestServicePrototypeMock.verify();

      redirect.restore();

      return true;
    });
  });

  it("fails to compute an authorization code with a disallowed request", () => {
    const clientId = faker.datatype.uuid();
    const redirectURI = faker.internet.url();
    const scope = faker.datatype.array().map((i) => i.toString()).filter((i) => !i.includes(","));
    const payload = {
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scope.join(","),
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

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(clientId)
      .returns({ allowRequest: () => false });
    requestServicePrototypeMock.expects("create").never();

    const redirect = sinon.spy(res, "redirect");

    const result = controller.authorize(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(redirect.notCalled).to.be.true;

      projectServicePrototypeMock.verify();
      requestServicePrototypeMock.verify();

      redirect.restore();

      return true;
    });
  });

  it("fails to compute an authorization code with another reason", () => {
    const clientId = faker.datatype.uuid();
    const redirectURI = faker.internet.url();
    const scope = faker.datatype.array().map((i) => i.toString()).filter((i) => !i.includes(","));
    const payload = {
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scope.join(","),
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

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(clientId)
      .throws(new Error("Cannot access database"));
    requestServicePrototypeMock.expects("create").never();

    const redirect = sinon.spy(res, "redirect");

    const result = controller.authorize(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(redirect.notCalled).to.be.true;

      projectServicePrototypeMock.verify();
      requestServicePrototypeMock.verify();

      redirect.restore();

      return true;
    });
  });

  it("computes an oauth2 access token", () => {
    const clientId = faker.datatype.uuid();
    const clientSecret = faker.datatype.hexaDecimal(32).substring(2).toLowerCase();
    const code = faker.datatype.hexaDecimal(16).substring(2).toLowerCase();

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    };
    const req = { body: payload };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    const mockRequest = new RequestModel({ clientId, code });

    requestServicePrototypeMock
      .expects("findByClientIdAndCode")
      .once()
      .withArgs({
        clientId,
        code,
      })
      .returns(mockRequest);
    requestServicePrototypeMock
      .expects("token")
      .once()
      .returns({ token: "token" });
    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(clientId)
      .returns({ verifySecret: () => true });

    const json = sinon.spy(res, "json");
    const status = sinon.spy(res, "status");
    const nextSpy = sinon.spy(next);

    const result = controller.token(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(status.calledOnceWith(200)).to.be.true;
      expect(json.calledOnceWith({ access_token: "token", token_type: "Bearer" })).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();
      requestServicePrototypeMock.verify();

      return true;
    });
  });
});
