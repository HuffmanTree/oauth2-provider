import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import sinon from "sinon";
import { OAuth2DatabaseClient } from "../../src/models";
import { UserModel } from "../../src/models/user.model";
import { UserService } from "../../src/services/user.service";

chai.use(chaiAsPromised);

describe("UserService", () => {
  const { user: model } = new OAuth2DatabaseClient({});
  const service = new UserService(model);
  let userModelMock: sinon.SinonMock;
  let userModelPrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    userModelMock = sinon.mock(UserModel);
    userModelPrototypeMock = sinon.mock(UserModel.prototype);
  });

  afterEach(() => {
    userModelMock.restore();
    userModelPrototypeMock.restore();
  });

  it("creates a user", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const mockUser = new UserModel(payload);

    userModelMock.expects("create").once().withArgs(payload).returns(mockUser);

    const result = service.create(payload);

    userModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(UserModel)
      .and.to.satisfy((user: UserModel) => user.equals(mockUser));
  });

  it("finds a user from its id", () => {
    const id = faker.datatype.uuid();
    const mockUser = new UserModel({ id });

    userModelMock.expects("findByPk").once().withArgs(id).returns(mockUser);

    const result = service.findById(id);

    userModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(UserModel)
      .and.to.satisfy((user: UserModel) => user.id === id);
  });

  it("finds a user from an email", () => {
    const email = faker.internet.email();
    const mockUser = new UserModel({ email });

    userModelMock
      .expects("findOne")
      .once()
      .withArgs({ rejectOnEmpty: true, where: { email } })
      .returns(mockUser);

    const result = service.findByEmail(email);

    userModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(UserModel)
      .and.to.satisfy((user: UserModel) => user.email == email);
  });

  it("updates a user", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const email = faker.internet.email();
    const originalUser = new UserModel(payload);
    const mockUser = originalUser.set("email", email);

    userModelPrototypeMock
      .expects("update")
      .once()
      .withArgs({ email })
      .returns(mockUser);

    const result = service.update(originalUser, { email });

    userModelPrototypeMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(UserModel)
      .and.to.satisfy((user: UserModel) => user.equals(mockUser));
  });

  it("destroys a user", () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const originalUser = new UserModel(payload);

    userModelPrototypeMock
      .expects("destroy")
      .once()
      .withArgs()
      .returns(undefined);

    const result = service.destroy(originalUser);

    userModelPrototypeMock.verify();

    return expect(result).to.eventually.be.undefined;
  });
});
