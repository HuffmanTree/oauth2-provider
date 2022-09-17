import { UserModel } from "../../src/models/user.model";
import { Sequelize } from "sequelize";
import { expect } from "chai";
import itParam from "mocha-param";

describe("UserModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  it("initializes the model", () => {
    const result = UserModel.initialize(sequelize);

    expect(result).to.equal(UserModel);
  });

  itParam(
    "detects ${value.state} password",
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
    ],
    ({ userPassword, inputPassword, expectedValidated }) => {
      const user = new UserModel({
        password: userPassword,
      });

      expect(user.verifyPassword(inputPassword)).to.equal(expectedValidated);
    }
  );
});
