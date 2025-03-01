import { expect } from "chai";
import { match, spy } from "sinon";
import { Scope } from "../../models/user.model.js";
import { ProjectService } from "../../services/project.service.js";
import { fakeProjectModel } from "../helpers/models.helper.js";

describe("ProjectService", () => {
  let service: ProjectService;
  const projectModel = fakeProjectModel();

  before(function () {
    service = new ProjectService(projectModel);
  });

  describe("create", () => {
    it("creates a project", async function () {
      const create = spy(projectModel, "create");

      const result = await service.create({ name: "My project", redirectURL: "http://domain.fr", scope: [Scope.FAMILY_NAME, Scope.EMAIL], creator: "userId" });

      expect(create.calledOnceWithExactly({ name: "My project", redirectURL: "http://domain.fr", scope: ["family_name", "email"], creator: "userId", secret: match.string })).to.be.true;
      expect(result)
        .to.include({ name: "My project", redirectURL: "http://domain.fr", creator: "userId" })
        .and.to.have.property("secret")
        .and.to.be.a("string")
        .and.to.match(/^[0-9a-f]+$/)
        .and.to.have.lengthOf(64);
      create.restore();
    });
  });

  describe("findById", () => {
    it("finds a project from its id", async function () {
      const findByPk = spy(projectModel, "findByPk");

      const result = await service.findById("id");

      expect(findByPk.calledOnceWith("id")).to.be.true;
      expect(result).to.include({ id: "id" });
      findByPk.restore();
    });
  });
});
