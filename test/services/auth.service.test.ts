import fs from "fs";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import sinon from "sinon";
import { UserModel } from "../../src/models/user.model";
import { AuthService } from "../../src/services/auth.service";
import jwt from "jsonwebtoken";

chai.use(chaiAsPromised);

describe("AuthService", () => {
  let service: AuthService;
  let userModelPrototypeMock: sinon.SinonMock;
  let jwtMock: sinon.SinonMock;

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

    service = new AuthService();

    fsMock.verify();
    fsMock.restore();
  });

  beforeEach(() => {
    userModelPrototypeMock = sinon.mock(UserModel.prototype);
    jwtMock = sinon.mock(jwt);
  });

  afterEach(() => {
    userModelPrototypeMock.restore();
    jwtMock.restore();
  });

  it("logs a user in with a valid password", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.findName();
    const mockUser = new UserModel({ email, password, name });

    userModelPrototypeMock
      .expects("verifyPassword")
      .once()
      .withArgs(password)
      .returns(true);
    jwtMock
      .expects("sign")
      .once()
      .withArgs(
        {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        Buffer.from("secret"),
        undefined
      )
      .returns("jwt");

    const result = service.login(mockUser, password);

    return expect(result).to.be.eventually.a("string").and.to.equal("jwt");
  });

  it("fails to log user in with an invalid password", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const inputPassword = faker.internet.password();
    const mockUser = new UserModel({ email, password });

    userModelPrototypeMock
      .expects("verifyPassword")
      .once()
      .withArgs(inputPassword)
      .returns(false);

    const result = service.login(mockUser, inputPassword);

    return expect(result).to.eventually.be.rejected;
  });

  it("verifies a token", () => {
    const token = "jwt";
    const id = faker.datatype.uuid();

    jwtMock
      .expects("verify")
      .once()
      .withArgs(token, Buffer.from("secret"), undefined)
      .returns({ id });

    const result = service.verify(token);

    return expect(result).to.eventually.be.a("string").and.to.equal(id);
  });

  it("verifies a token with a warning", () => {
    const token = "jwt";
    const payload = faker.datatype.hexaDecimal();

    jwtMock
      .expects("verify")
      .once()
      .withArgs(token, Buffer.from("secret"), undefined)
      .returns(payload);

    const result = service.verify(token);

    return expect(result).to.eventually.be.a("string").and.to.equal(payload);
  });
});
