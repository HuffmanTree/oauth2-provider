import { UserModel } from "../../src/models/user.model";
import { Sequelize } from "sequelize";
import { expect } from "chai";

describe("UserModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  it("initializes the model", () => {
    const result = UserModel.initialize(sequelize);

    expect(result).to.equal(UserModel);
  });
});
