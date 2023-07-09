import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { ProjectService } from "../../src/services/project.service";
import { loggerMock } from "../helpers/mocks.helper";
import { fakeProjectModel } from "../helpers/models.helper";

const test = sinonTest(sinon);

describe("ProjectService", () => {
  let service: ProjectService;
  const ProjectModel = fakeProjectModel();

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    service = new ProjectService(ProjectModel);
  }));

  describe("create", () => {
    it("creates a project", test(async function () {
      const create = this.spy(ProjectModel, "create");

      const result = await service.create({ name: "My project", redirectURL: "http://domain.fr", scope: ["family_name", "email"], creator: "userId" });

      expect(create.calledOnceWithExactly({ name: "My project", redirectURL: "http://domain.fr", scope: ["family_name", "email"], creator: "userId", secret: match.string })).to.be.true;
      expect(result)
        .to.include({ name: "My project", redirectURL: "http://domain.fr", creator: "userId" })
        .and.to.have.property("secret")
        .and.to.be.a("string")
        .and.to.match(/^[0-9a-f]+$/)
        .and.to.have.lengthOf(64);
    }));
  });

  describe("findById", () => {
    it("finds a project from its id", test(async function () {
      const findByPk = this.spy(ProjectModel, "findByPk");

      const result = await service.findById("id");

      expect(findByPk.calledOnceWithExactly("id", { rejectOnEmpty: match.instanceOf(EmptyResultError) })).to.be.true;
      expect(result).to.include({ id: "id" });
    }));
  });
});
