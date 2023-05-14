import { OAuth2DatabaseClient } from "../../src/models";
import { RequestService } from "../../src/services/request.service";
import { OAuth2Controller } from "../../src/controllers/oauth2.controller";
import sinon from "sinon";
import chai, { expect } from "chai";
import faker from "faker";
import chaiAsPromised from "chai-as-promised";
import { RequestModel } from "../../src/models/request.model";
import { ProjectService } from "../../src/services/project.service";
import { ProjectModel } from "../../src/models/project.model";
import { EmptyResultError } from "sequelize";

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
});
