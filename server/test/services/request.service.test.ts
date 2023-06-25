import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { RequestService } from "../../src/services/request.service";
import { loggerMock } from "../helpers/mocks.helper";
import { fakeRequestModel } from "../helpers/models.helper";

const test = sinonTest(sinon);

describe("RequestService", () => {
  let service: RequestService;
  const RequestModel = fakeRequestModel();

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    service = new RequestService(RequestModel);
  }));

  describe("create", () => {
    it("creates a request", test(async function () {
      const create = this.spy(RequestModel, "create");

      const result = await service.create({ resourceOwner: "userId", clientId: "projectId", scope: ["name", "email"] });

      expect(create.calledOnceWithExactly({ resourceOwner: "userId", clientId: "projectId", scope: ["name", "email"], code: match.string })).to.be.true;
      expect(result)
        .to.include({ resourceOwner: "userId", clientId: "projectId" })
        .and.to.have.property("code")
        .and.to.be.a("string")
        .and.to.match(/^[0-9a-f]+$/)
        .and.to.have.lengthOf(16);
    }));
  });

  describe("token", () => {
    it("adds a token to a request", test(async function () {
      const request = await RequestModel.findByPk("id", { rejectOnEmpty: true });
      const update = this.spy(request, "update");

      const result = await service.token(request);

      // RegExp for Base64
      expect(update.calledOnceWithExactly({ token: match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/) })).to.be.true;
      expect(result)
        .to.include({ id: "id" })
        .and.to.have.property("token")
        .and.to.be.a("string")
        .and.to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
    }));
  });

  describe("findByClientIdAndCode", () => {
    it("finds a request from its client id and authorization code", test(async function () {
      const findOne = this.spy(RequestModel, "findOne");

      const result = await service.findByClientIdAndCode({ clientId: "projectId", code: "code" });

      expect(findOne.calledOnceWithExactly({ where: { clientId: "projectId", code: "code" }, rejectOnEmpty: match.instanceOf(EmptyResultError) })).to.be.true;
      expect(result).to.include({ clientId: "projectId", code: "code" });
    }));
  });

  describe("findByToken", () => {
    it("finds a request from its access token", test(async function () {
      const findOne = this.spy(RequestModel, "findOne");

      const result = await service.findByToken({ token: "token" });

      expect(findOne.calledOnceWithExactly({ where: { token: "token" }, rejectOnEmpty: match.instanceOf(EmptyResultError) })).to.be.true;
      expect(result).to.include({ token: "token" });
    }));
  });
});
