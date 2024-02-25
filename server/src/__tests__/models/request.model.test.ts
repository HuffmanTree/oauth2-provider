import { expect } from "chai";
import { Sequelize } from "sequelize";
import { ProjectModel } from "../../models/project.model.js";
import { RequestModel } from "../../models/request.model.js";
import { UserModel } from "../../models/user.model.js";

describe("RequestModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  describe("initialize", () => {
    it("initializes the model", () => {
      UserModel.initialize(sequelize);
      ProjectModel.initialize(sequelize);

      const result = RequestModel.initialize(sequelize);

      expect(result).to.equal(RequestModel);
    });
  });
});
