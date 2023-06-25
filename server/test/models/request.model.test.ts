import { expect } from "chai";
import { Sequelize } from "sequelize";
import { RequestModel } from "../../src/models/request.model";

describe("RequestModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  describe("initialize", () => {
    it("initializes the model", () => {
      const result = RequestModel.initialize(sequelize);

      expect(result).to.equal(RequestModel);
    });
  });
});
