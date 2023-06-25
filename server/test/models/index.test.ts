import { expect } from "chai";
import { Sequelize } from "sequelize";
import sinon from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { OAuth2DatabaseClient } from "../../src/models/index";
import { ProjectModel } from "../../src/models/project.model";
import { RequestModel } from "../../src/models/request.model";
import { UserModel } from "../../src/models/user.model";
import { loggerMock } from "../helpers/mocks.helper";

const test = sinonTest(sinon);

describe("OAuth2DatabaseClient", () => {
  let service: OAuth2DatabaseClient;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    service = new OAuth2DatabaseClient({});
  }));

  describe("connect", () => {
    it("connects the client", test(async function () {
      const sequelize = this.mock(Sequelize.prototype);

      sequelize.expects("sync").once().withArgs({ force: false });

      await service.connect();
    }));
  });

  describe("disconnect", () => {
    it("disconnects the client", test(async function() {
      const sequelize = this.mock(Sequelize.prototype);

      sequelize.expects("close").once().withArgs();

      await service.disconnect();
    }));
  });

  describe("models", () => {
    [
      { name: "user", expectedModel: UserModel },
      { name: "project", expectedModel: ProjectModel },
      { name: "request", expectedModel: RequestModel },
    ].forEach(({ name, expectedModel }) =>
      it(`gets the associated ${name} model`, function () {
        expect(service[name]).to.equal(expectedModel);
      }));
  });
});
