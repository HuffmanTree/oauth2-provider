import { expect } from "chai";
import { Sequelize } from "sequelize";
import { match, spy } from "sinon";
import { RequestService } from "../../services/request.service.js";
import { fakeRequestModel } from "../helpers/models.helper.js";

describe("RequestService", () => {
  let service: RequestService;
  const RequestModel = fakeRequestModel();

  before(function () {
    service = new RequestService(RequestModel);
  });

  describe("create", () => {
    it("creates a request", async function () {
      const create = spy(RequestModel, "create");

      const result = await service.create({ resourceOwner: "userId", clientId: "projectId", scope: ["family_name", "email"] });

      expect(create.calledOnceWithExactly({ resourceOwner: "userId", clientId: "projectId", scope: ["family_name", "email"], code: match.string })).to.be.true;
      expect(result)
        .to.include({ resourceOwner: "userId", clientId: "projectId" })
        .and.to.have.property("code")
        .and.to.be.a("string")
        .and.to.match(/^[0-9a-f]+$/)
        .and.to.have.lengthOf(16);
      create.restore();
    });
  });

  describe("token", () => {
    it("adds a token to a request", async function () {
      const request = await RequestModel.findByPk("id", { rejectOnEmpty: true });
      const update = spy(request, "update");

      const result = await service.token(request);

      // RegExp for Base64
      expect(update.calledOnceWithExactly({
        token: match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
        expiredAt: Sequelize.literal("now() + interval '1' hour"),
      })).to.be.true;
      expect(result)
        .to.include({ id: "id" })
        .and.to.have.property("token")
        .and.to.be.a("string")
        .and.to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
      update.restore();
    });
  });

  describe("findByClientIdAndCode", () => {
    it("finds a request from its client id and authorization code", async function () {
      const findOne = spy(RequestModel, "findOne");

      const result = await service.findByClientIdAndCode({ clientId: "projectId", code: "code" });

      expect(findOne.calledWithMatch({ where: { clientId: "projectId", code: "code" } })).to.be.true;
      expect(result).to.include({ clientId: "projectId", code: "code" });
      findOne.restore();
    });
  });

  describe("findByToken", () => {
    it("finds a request from its access token", async function () {
      const findOne = spy(RequestModel, "findOne");

      const result = await service.findByToken({ token: "token" });

      expect(findOne.calledWithMatch({ where: { token: "token" } })).to.be.true;
      expect(result).to.include({ token: "token" });
      findOne.restore();
    });
  });
});
