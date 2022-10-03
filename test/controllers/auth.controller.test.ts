import fs from "fs";
import sinon from "sinon";
import { expect } from "chai";
import faker from "faker";
import { OAuth2DatabaseClient } from "../../src/models";
import { UserService } from "../../src/services/user.service";
import { AuthService } from "../../src/services/auth.service";
import { AuthController } from "../../src/controllers/auth.controller";
import { UserModel } from "../../src/models/user.model";
import { EmptyResultError } from "sequelize";

describe("AuthController", () => {
  const { user: model } = new OAuth2DatabaseClient({});
  const userService = new UserService(model);
  let authService: AuthService;
  let controller: AuthController;
  let userServicePrototypeMock: sinon.SinonMock;
  let authServicePrototypeMock: sinon.SinonMock;

  before(() => {
    const fsMock = sinon.mock(fs);

    fsMock
      .expects("readFileSync")
      .once()
      .withArgs("/tmp/test.key")
      .returns(Buffer.from("secret"));
    fsMock
      .expects("readFileSync")
      .once()
      .withArgs("/tmp/test.key.pub")
      .returns(Buffer.from("secret"));

    authService = new AuthService();
    controller = new AuthController(userService, authService);

    fsMock.verify();
    fsMock.restore();
  });

  beforeEach(() => {
    userServicePrototypeMock = sinon.mock(UserService.prototype);
    authServicePrototypeMock = sinon.mock(AuthService.prototype);
  });

  afterEach(() => {
    userServicePrototypeMock.restore();
    authServicePrototypeMock.restore();
  });

  it("logs a user in", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const payload = {
      email,
      password,
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
    const mockUser = new UserModel(payload);

    userServicePrototypeMock
      .expects("findByEmail")
      .once()
      .withArgs(email)
      .returns(mockUser);
    authServicePrototypeMock
      .expects("login")
      .once()
      .withArgs(mockUser, password)
      .returns("jwt");

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");
    const nextSpy = sinon.spy(next);

    const result = controller.login(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      const payload = {
        token: "jwt",
        message: `Logged in as ${mockUser.id}`,
      };
      expect(statusSpy.calledOnceWith(200)).to.be.true;
      expect(jsonSpy.calledOnceWith(payload)).to.be.true;
      expect(nextSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();
      authServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to log a user in with an invalid email", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const payload = {
      email,
      password,
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

    userServicePrototypeMock
      .expects("findByEmail")
      .once()
      .withArgs(email)
      .throws(new EmptyResultError(""));
    authServicePrototypeMock.expects("login").never();

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.login(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();
      authServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to log a user in with an invalid password", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const payload = {
      email,
      password,
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
    const mockUser = new UserModel(payload);

    userServicePrototypeMock
      .expects("findByEmail")
      .once()
      .withArgs(email)
      .returns(mockUser);
    authServicePrototypeMock
      .expects("login")
      .once()
      .withArgs(mockUser, password)
      .throws(new Error("Invalid password"));

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.login(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();
      authServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });

  it("fails to log a user in with another reason", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const payload = {
      email,
      password,
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

    userServicePrototypeMock
      .expects("findByEmail")
      .once()
      .withArgs(email)
      .throws(new Error("Cannot access database"));
    authServicePrototypeMock.expects("login").never();

    const statusSpy = sinon.spy(res, "status");
    const jsonSpy = sinon.spy(res, "json");

    const result = controller.login(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(statusSpy.notCalled).to.be.true;
      expect(jsonSpy.notCalled).to.be.true;

      userServicePrototypeMock.verify();
      authServicePrototypeMock.verify();

      statusSpy.restore();
      jsonSpy.restore();

      return true;
    });
  });
});
