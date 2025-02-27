import { expect } from "chai";
import { Sequelize } from "sequelize";
import { isScope, UserModel } from "../../models/user.model.js";

describe("UserModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  describe("initialize", () => {
    it("initializes the model", () => {
      const result = UserModel.initialize(sequelize);

      expect(result).to.equal(UserModel);
    });
  });

  describe("verifyPassword", () => {
    [
      {
        state: "a valid",
        userPassword: "this_is_a_secret",
        inputPassword: "this_is_a_secret",
        expectedValidated: true,
      },
      {
        state: "an invalid",
        userPassword: "this_is_a_secret",
        inputPassword: "this_is_another_secret",
        expectedValidated: false,
      },
    ].forEach(({ state, userPassword, inputPassword, expectedValidated }) =>
      it(`detects ${state} password`, function () {
        const user = new UserModel({ email: "", givenName: "", familyName: "", picture: "", phoneNumber: "", birthdate: "", gender: "", password: userPassword });

        expect(user.verifyPassword(inputPassword)).to.equal(expectedValidated);
      }));
  });

  describe("isScope", () => {
    expect(isScope("profile")).to.be.true;
    expect(isScope("other")).to.be.false;
  });
});
