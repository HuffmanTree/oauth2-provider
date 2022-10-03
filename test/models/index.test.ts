import { expect } from "chai";
import { Sequelize } from "sequelize";
import sinon from "sinon";
import { OAuth2DatabaseClient } from "../../src/models/index";
import { UserModel } from "../../src/models/user.model";

let service: OAuth2DatabaseClient;

describe("OAuth2DatabaseClient", () => {
  before(() => {
    const spy = sinon.spy(UserModel, "initialize");

    service = new OAuth2DatabaseClient({});

    expect(spy.calledOnce).to.be.true;

    spy.restore();
  });

  it("connects the client", async () => {
    const mock = sinon.mock(Sequelize.prototype);

    mock.expects("sync").once().withArgs({ force: false });

    await service.connect();

    mock.verify();
    mock.restore();
  });

  it("disconnects the client", async () => {
    const mock = sinon.mock(Sequelize.prototype);

    mock.expects("close").once().withArgs();

    await service.disconnect();

    mock.verify();
    mock.restore();
  });

  it("gets the associated user model", () => {
    expect(service.user).to.equal(UserModel);
  });
});
