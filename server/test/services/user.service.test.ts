import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { UserService } from "../../src/services/user.service";
import { loggerMock } from "../helpers/mocks.helper";
import { fakeUserModel } from "../helpers/models.helper";

const test = sinonTest(sinon);

describe("UserService", () => {
  let service: UserService;
  const UserModel = fakeUserModel();

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    service = new UserService(UserModel);
  }));

  describe("create", () => {
    it("creates a user", test(async function () {
      const create = this.spy(UserModel, "create");

      const result = await service.create({ givenName: "Jane", familyName: "Doe", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", password: "secret" });

      expect(create.calledOnceWithExactly({ givenName: "Jane", familyName: "Doe", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", password: "secret" })).to.be.true;
      expect(result).to.include({ givenName: "Jane", familyName: "Doe", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", password: "secret" });
    }));
  });

  describe("findById", () => {
    it("finds a user from its id", test(async function () {
      const findByPk = this.spy(UserModel, "findByPk");

      const result = await service.findById("id");

      expect(findByPk.calledOnceWithExactly("id", { attributes: undefined, rejectOnEmpty: match.instanceOf(EmptyResultError) })).to.be.true;
      expect(result).to.include({ id: "id" });
    }));
  });

  describe("findByEmail", () => {
    it("finds a user from an email", test(async function () {
      const findOne = this.spy(UserModel, "findOne");

      const result = await service.findByEmail("user@domain.fr");

      expect(findOne.calledOnceWithExactly({ rejectOnEmpty: true, where: { email: "user@domain.fr" } })).to.be.true;
      expect(result).to.include({ email: "user@domain.fr" });
    }));
  });

  describe("update", () => {
    it("updates a user", test(async function () {
      const user = await UserModel.findByPk("id", { rejectOnEmpty: true });
      const update = this.spy(user, "update");

      const result = await service.update(user, { email: "updated-user@domain.fr" });

      expect(update.calledOnceWithExactly({ email: "updated-user@domain.fr" })).to.be.true;
      expect(result).to.include({ id: "id" , email: "updated-user@domain.fr" });
    }));
  });

  describe("destroy", () => {
    it("destroys a user", test(async function () {
      const user = await UserModel.findOne({ rejectOnEmpty: true });
      const destroy = this.spy(user, "destroy");

      const result = await service.destroy(user);

      expect(destroy.calledOnceWithExactly()).to.be.true;
      expect(result).to.be.undefined;
    }));
  });
});
