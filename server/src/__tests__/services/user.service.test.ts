import { expect } from "chai";
import { spy } from "sinon";
import { UserService } from "../../services/user.service.js";
import { fakeUserModel } from "../helpers/models.helper.js";

describe("UserService", () => {
  let service: UserService;
  const UserModel = fakeUserModel();

  before(function () {
    service = new UserService(UserModel);
  });

  describe("create", () => {
    it("creates a user", async function () {
      const create = spy(UserModel, "create");

      const result = await service.create({ givenName: "Jane", familyName: "Doe", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", gender: "female", password: "secret" });

      expect(create.calledOnceWithExactly({ givenName: "Jane", familyName: "Doe", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", gender: "female", password: "secret" })).to.be.true;
      expect(result).to.include({ givenName: "Jane", familyName: "Doe", gender: "female", email: "user@domain.fr", birthdate: "2000-02-03", picture: "https://domain.com/me.png", password: "secret" });
      create.restore();
    });
  });

  describe("findById", () => {
    it("finds a user from its id", async function () {
      const findByPk = spy(UserModel, "findByPk");

      const result = await service.findById("id");

      expect(findByPk.calledOnceWith("id")).to.be.true;
      expect(result).to.include({ id: "id" });
      findByPk.restore();
    });
  });

  describe("findByEmail", () => {
    it("finds a user from an email", async function () {
      const findOne = spy(UserModel, "findOne");

      const result = await service.findByEmail("user@domain.fr");

      expect(findOne.calledWithMatch({ where: { email: "user@domain.fr" } })).to.be.true;
      expect(result).to.include({ email: "user@domain.fr" });
      findOne.restore();
    });
  });

  describe("update", () => {
    it("updates a user", async function () {
      const user = await UserModel.findByPk("id", { rejectOnEmpty: true });
      const update = spy(user, "update");

      const result = await service.update(user, { email: "updated-user@domain.fr" });

      expect(update.calledOnceWithExactly({ email: "updated-user@domain.fr" })).to.be.true;
      expect(result).to.include({ id: "id" , email: "updated-user@domain.fr" });
      update.restore();
    });
  });

  describe("destroy", () => {
    it("destroys a user", async function () {
      const user = await UserModel.findOne({ rejectOnEmpty: true });
      const destroy = spy(user, "destroy");

      const result = await service.destroy(user);

      expect(destroy.calledOnceWithExactly()).to.be.true;
      expect(result).to.be.undefined;
      destroy.restore();
    });
  });
});
