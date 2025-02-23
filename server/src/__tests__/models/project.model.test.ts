import { expect } from "chai";
import { Sequelize } from "sequelize";
import { ProjectModel } from "../../models/project.model.js";
import { Scope, UserModel } from "../../models/user.model.js";

describe("ProjectModel", () => {
  const sequelize = new Sequelize({
    dialect: "postgres",
  });

  describe("initialize", () => {
    it("initializes the model", () => {
      UserModel.initialize(sequelize);

      const result = ProjectModel.initialize(sequelize);

      expect(result).to.equal(ProjectModel);
    });
  });

  describe("verifySecret", () => {
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
    ].forEach(({ state, projectSecret, inputSecret, expectedValidated }) =>
      it(`detects ${state} secret`, function () {
        const project = new ProjectModel({ name: "", redirectURL: "", scope: [], creator: "", secret: projectSecret });

        expect(project.verifySecret(inputSecret)).to.equal(expectedValidated);
      }));
  });

  describe("allowRequest", () => {
    [
      {
        state: "a disallowed (invalid 'redirectURL')",
        projectRedirectURL: "this_is_a_redirect_url",
        projectScope: [Scope.GIVEN_NAME, Scope.FAMILY_NAME],
        inputRedirectURL: "this_is_another_redirect_url",
        inputScope: [Scope.GIVEN_NAME, Scope.FAMILY_NAME],
        expectedValidated: false,
      },
      {
        state: "a disallowed (invalid 'scope')",
        projectRedirectURL: "this_is_a_redirect_url",
        projectScope: [Scope.GIVEN_NAME, Scope.FAMILY_NAME],
        inputRedirectURL: "this_is_a_redirect_url",
        inputScope: [Scope.GIVEN_NAME, Scope.GENDER],
        expectedValidated: false,
      },
      {
        state: "an allowed",
        projectRedirectURL: "this_is_a_redirect_url",
        projectScope: [Scope.GIVEN_NAME, Scope.FAMILY_NAME],
        inputRedirectURL: "this_is_a_redirect_url",
        inputScope: [Scope.GIVEN_NAME, Scope.FAMILY_NAME],
        expectedValidated: true,
      },
    ].forEach(({ state, projectRedirectURL, projectScope, inputRedirectURL, inputScope, expectedValidated }) =>
      it(`detects ${state} request`, function () {
        const project = new ProjectModel({ name: "", creator: "", secret: "", redirectURL: projectRedirectURL, scope: projectScope });

        expect(project.allowRequest(inputRedirectURL, inputScope)).to.equal(expectedValidated);
      }));
  });
});
