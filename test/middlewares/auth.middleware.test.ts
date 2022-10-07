import { expect } from "chai";
import faker from "faker";
import fs from "fs";
import sinon from "sinon";
import { AuthMiddleware } from "../../src/middlewares/auth.middleware";
import { AuthService } from "../../src/services/auth.service";

describe("AuthMiddleware", () => {
  let authService: AuthService;
  let middleware: AuthMiddleware;
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
    middleware = new AuthMiddleware(authService);

    fsMock.verify();
    fsMock.restore();
  });

  beforeEach(() => {
    authServicePrototypeMock = sinon.mock(AuthService.prototype);
  });

  afterEach(() => {
    authServicePrototypeMock.restore();
  });

  it("authenticates a client", () => {
    const token = faker.datatype.hexaDecimal();
    const authorization = `Bearer ${token}`;
    const req = { headers: { authorization } };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      locals: {},
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;

    authServicePrototypeMock
      .expects("verify")
      .once()
      .withArgs(token)
      .returns(faker.datatype.uuid());

    const result = middleware.authenticate(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      authServicePrototypeMock.verify();

      return true;
    });
  });

  it("fails to authenticate without 'authorization' header", () => {
    const req = { headers: {} };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      setHeader(s: string) {
        void s;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    authServicePrototypeMock.expects("verify").never();

    const result = middleware.authenticate(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      authServicePrototypeMock.verify();

      return true;
    });
  });

  it("fails to authenticate with an unknown scheme", () => {
    const token = faker.datatype.hexaDecimal();
    const scheme = faker.datatype.string();
    const authorization = `${scheme} ${token}`;
    const req = { headers: { authorization } };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      setHeader(s: string) {
        void s;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    authServicePrototypeMock.expects("verify").never();

    const result = middleware.authenticate(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      authServicePrototypeMock.verify();

      return true;
    });
  });

  it("fails to authenticate with an invalid verification", () => {
    const token = faker.datatype.hexaDecimal();
    const authorization = `Bearer ${token}`;
    const req = { headers: { authorization } };
    const res = {
      status(n: number) {
        void n;

        return this;
      },
      setHeader(s: string) {
        void s;

        return this;
      },
      json(j: object) {
        void j;

        return this;
      },
    };
    const next = () => undefined;
    authServicePrototypeMock.expects("verify").once().withArgs(token).rejects();

    const result = middleware.authenticate(req, res, next);

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      authServicePrototypeMock.verify();

      return true;
    });
  });
});
