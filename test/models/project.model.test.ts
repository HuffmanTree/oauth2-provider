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
    },
  );

  itParam(
    "detects ${value.state} request",
    [
      {
	state: "a disallowed (invalid 'redirectURL')",
	projectRedirectURL: "this_is_a_redirect_url",
	projectScope: ["field1", "field2"],
	inputRedirectURL: "this_is_another_redirect_url",
	inputScope: ["field1", "field2"],
        expectedValidated: false,
      },
      {
	state: "a disallowed (invalid 'scope')",
	projectRedirectURL: "this_is_a_redirect_url",
	projectScope: ["field1", "field2"],
	inputRedirectURL: "this_is_a_redirect_url",
	inputScope: ["field1", "field3"],
        expectedValidated: false,
      },
      {
	state: "an allowed",
	projectRedirectURL: "this_is_a_redirect_url",
	projectScope: ["field1", "field2"],
	inputRedirectURL: "this_is_a_redirect_url",
	inputScope: ["field1", "field2"],
        expectedValidated: true,
      },
    ],
    ({ projectRedirectURL, projectScope, inputRedirectURL, inputScope, expectedValidated }) => {
      const project = new ProjectModel({
        redirectURL: projectRedirectURL,
        scope: projectScope,
      });

      expect(project.allowRequest(inputRedirectURL, inputScope)).to.equal(expectedValidated);
    });
});
