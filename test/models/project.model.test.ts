import { ProjectModel } from "../../src/models/project.model";
import { Sequelize } from "sequelize";
import { expect } from "chai";
import itParam from "mocha-param";

describe("ProjectModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  it("initializes the model", () => {
    const result = ProjectModel.initialize(sequelize);

    expect(result).to.equal(ProjectModel);
  });

  itParam(
    "detects ${value.state} secret",
    [
      {
        state: "a valid",
        projectSecret: "this_is_a_secret",
        inputSecret: "this_is_a_secret",
        expectedValidated: true,
      },
      {
        state: "an invalid",
        projectSecret: "this_is_a_secret",
        inputSecret: "this_is_another_secret",
        expectedValidated: false,
      },
    ],
    ({ projectSecret, inputSecret, expectedValidated }) => {
      const project = new ProjectModel({
        secret: projectSecret,
      });

      expect(project.verifySecret(inputSecret)).to.equal(expectedValidated);
    }
  );
});
