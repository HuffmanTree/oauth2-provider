import { OAuth2DatabaseClient } from "../../src/models";
import { ProjectService } from "../../src/services/project.service";
import { ProjectController } from "../../src/controllers/project.controller";
import sinon from "sinon";
import chai, { expect } from "chai";
import faker from "faker";
import { ProjectModel } from "../../src/models/project.model";
import chaiAsPromised from "chai-as-promised";
import { EmptyResultError, UniqueConstraintError } from "sequelize";

chai.use(chaiAsPromised);

describe("ProjectController", () => {
  const { project: model } = new OAuth2DatabaseClient({});
  const service = new ProjectService(model);
  const controller = new ProjectController(service);
  let projectServicePrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    projectServicePrototypeMock = sinon.mock(ProjectService.prototype);
  });

  afterEach(() => {
    projectServicePrototypeMock.restore();
  });

  it("creates a project", () => {
    const payload = {
      name: faker.name.findName(),
      redirectURL: faker.internet.url(),
      scope: faker.datatype.array().map((i) => i.toString()),
    };
    const creator = faker.datatype.uuid();
    const req = { body: payload, baseUrl: "/api/projects", path: "/" };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      setHeader(k: string, v: string) {
        void k, v;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
      locals: { user: creator },
    };
    const next = () => undefined;
    const mockProject = new ProjectModel({ ...payload, creator });
    const project = mockProject.toJSON();

    projectServicePrototypeMock
      .expects("create")
      .once()
      .withArgs({ ...payload, creator })
      .returns(mockProject);

    const setHeader = sinon.spy(res, "setHeader");
    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(
        setHeader.calledOnceWith("Location", `/api/projects/${mockProject.id}`)
      ).to.be.true;
      expect(statusSpy.calledOnceWith(201)).to.be.true;
      expect(jsonSpy.calledOnceWith(project)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to create a project", () => {
    const payload = {
      name: faker.name.findName(),
      redirectURL: faker.internet.url(),
      scope: faker.datatype.array().map((i) => i.toString()),
    };
    const creator = faker.datatype.uuid();
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
      locals: { user: creator },
    };
    const next = (err?: Error) => {
      void err;
    };

    projectServicePrototypeMock
      .expects("create")
      .once()
      .withArgs({ ...payload, creator })
      .rejects(new Error());

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to create a project when a conflict occurs", () => {
    const payload = {
      name: faker.name.findName(),
      redirectURL: faker.internet.url(),
      scope: faker.datatype.array().map((i) => i.toString()),
    };
    const creator = faker.datatype.uuid();
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
      locals: { user: creator },
    };
    const next = (err?: Error) => {
      void err;
    };

    projectServicePrototypeMock
      .expects("create")
      .once()
      .withArgs({ ...payload, creator })
      .rejects(new UniqueConstraintError({ errors: [{ message: "" }] }));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("finds a project", () => {
    const payload = {
      id: faker.datatype.uuid(),
    };
    const req = { params: payload };
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
    const mockProject = new ProjectModel(payload);
    const { secret, ...projectWithoutSecret } = mockProject.toJSON();

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(mockProject);

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.find(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.calledOnceWith(200)).to.be.true;
      expect(jsonSpy.calledOnceWith(projectWithoutSecret)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to find a project", () => {
    const payload = {
      id: faker.datatype.uuid(),
    };
    const req = { params: payload };
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
    const next = (err?: Error) => {
      void err;
    };

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .rejects(new Error());

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.find(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to find a project when not found", () => {
    const payload = {
      id: faker.datatype.uuid(),
    };
    const req = { params: payload };
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
    const next = (err?: Error) => {
      void err;
    };

    projectServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .rejects(new EmptyResultError(""));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.find(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      projectServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });
});
