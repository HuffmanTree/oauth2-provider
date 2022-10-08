import { OAuth2DatabaseClient } from "../../src/models";
import { UserService } from "../../src/services/user.service";
import { UserController } from "../../src/controllers/user.controller";
import sinon from "sinon";
import chai, { expect } from "chai";
import faker from "faker";
import { UserModel } from "../../src/models/user.model";
import chaiAsPromised from "chai-as-promised";
import { EmptyResultError, UniqueConstraintError } from "sequelize";

chai.use(chaiAsPromised);

describe("UserController", () => {
  const { user: model } = new OAuth2DatabaseClient({});
  const service = new UserService(model);
  const controller = new UserController(service);
  let userServicePrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    userServicePrototypeMock = sinon.mock(UserService.prototype);
  });

  afterEach(() => {
    userServicePrototypeMock.restore();
  });

  it("creates a user", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const req = { body: payload, baseUrl: "/api/users", path: "/" };
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
    };
    const next = () => undefined;
    const mockUser = new UserModel(payload);
    const { password, ...userWithoutPassword } = mockUser.toJSON();

    userServicePrototypeMock
      .expects("create")
      .once()
      .withArgs(payload)
      .returns(mockUser);

    const setHeader = sinon.spy(res, "setHeader");
    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(setHeader.calledOnceWith("Location", `/api/users/${mockUser.id}`))
        .to.be.true;
      expect(statusSpy.calledOnceWith(201)).to.be.true;
      expect(jsonSpy.calledOnceWith(userWithoutPassword)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to create a user", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
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
    const next = (err?: Error) => {
      void err;
    };

    userServicePrototypeMock
      .expects("create")
      .once()
      .withArgs(payload)
      .rejects(new Error());

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to create a user when a conflict occurs", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
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
    const next = (err?: Error) => {
      void err;
    };

    userServicePrototypeMock
      .expects("create")
      .once()
      .withArgs(payload)
      .rejects(new UniqueConstraintError({ errors: [{ message: "" }] }));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.create(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("finds a user", () => {
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
    const mockUser = new UserModel(payload);
    const { password, ...userWithoutPassword } = mockUser.toJSON();

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(mockUser);

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.find(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.calledOnceWith(200)).to.be.true;
      expect(jsonSpy.calledOnceWith(userWithoutPassword)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to find a user", () => {
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

    userServicePrototypeMock
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

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to find a user when not found", () => {
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

    userServicePrototypeMock
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

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("updates a user", () => {
    const payload = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const req = {
      params: { id: payload.id },
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      },
    };
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
    const mockUser = new UserModel(payload);
    const originalUser = new UserModel({ id: payload.id });
    const { password, ...userWithoutPassword } = mockUser.toJSON();

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("update")
      .once()
      .withArgs(originalUser, req.body)
      .returns(mockUser);

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.update(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.calledOnceWith(200)).to.be.true;
      expect(jsonSpy.calledOnceWith(userWithoutPassword)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to update a user", () => {
    const payload = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const req = {
      params: { id: payload.id },
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      },
    };
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
    const originalUser = new UserModel({ id: payload.id });

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("update")
      .once()
      .withArgs(originalUser, req.body)
      .rejects(new Error());

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.update(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to update a user when not found", () => {
    const payload = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const req = {
      params: { id: payload.id },
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      },
    };
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
    const originalUser = new UserModel({ id: payload.id });

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("update")
      .once()
      .withArgs(originalUser, req.body)
      .rejects(new EmptyResultError(""));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.update(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to update a user when a conflict occurs", () => {
    const payload = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const req = {
      params: { id: payload.id },
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      },
    };
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
    const originalUser = new UserModel({ id: payload.id });

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("update")
      .once()
      .withArgs(originalUser, req.body)
      .rejects(new UniqueConstraintError({ errors: [{ message: "" }] }));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.update(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("destroys a user", () => {
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
    const originalUser = new UserModel(payload);

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("destroy")
      .once()
      .withArgs(originalUser)
      .returns(undefined);

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.destroy(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.calledOnceWith(200)).to.be.true;
      expect(jsonSpy.calledOnceWith({ deleted: payload.id })).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to destroy a user", () => {
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
    const originalUser = new UserModel({ id: payload.id });

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("destroy")
      .once()
      .withArgs(originalUser)
      .rejects(new Error());

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.destroy(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to destroy a user when not found", () => {
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
    const originalUser = new UserModel({ id: payload.id });

    userServicePrototypeMock
      .expects("findById")
      .once()
      .withArgs(payload.id)
      .returns(originalUser);
    userServicePrototypeMock
      .expects("destroy")
      .once()
      .withArgs(originalUser)
      .rejects(new EmptyResultError(""));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.destroy(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });
});
