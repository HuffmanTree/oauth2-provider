import { expect } from "chai";
import { Sequelize } from "sequelize";
import { mock } from "sinon";
import { OAuth2DatabaseClient } from "../../models/index.js";
import { ProjectModel } from "../../models/project.model.js";
import { RequestModel } from "../../models/request.model.js";
import { UserModel } from "../../models/user.model.js";

describe("OAuth2DatabaseClient", () => {
  let service: OAuth2DatabaseClient;

  before(function () {
    service = new OAuth2DatabaseClient({});
  });

  describe("connect", () => {
    it("connects the client", async function () {
      const sequelize = mock(Sequelize.prototype);

      sequelize.expects("sync").once().withArgs({ force: false });

      await service.connect();
      sequelize.restore();
    });
  });

  describe("disconnect", () => {
    it("disconnects the client", async function() {
      const sequelize = mock(Sequelize.prototype);

      sequelize.expects("close").once().withArgs();

      await service.disconnect();
      sequelize.restore();
    });
  });

  describe("models", () => {
    ([
      { name: "user", expectedModel: UserModel },
      { name: "project", expectedModel: ProjectModel },
      { name: "request", expectedModel: RequestModel },
    ] as const).forEach(({ name, expectedModel }) =>
      it(`gets the associated ${name} model`, function () {
        expect(service[name]).to.equal(expectedModel);
      }));
  });
});
