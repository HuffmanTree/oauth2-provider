import { expect } from "chai";
import { EmptyResultError, UniqueConstraintError, ValidationErrorItem } from "sequelize";
import { match, spy, mock } from "sinon";
import { ProjectController } from "../../controllers/project.controller.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeProjectModel } from "../helpers/models.helper.js";
import { fakeProjectService } from "../helpers/services.helper.js";

describe("ProjectController", () => {
  let controller: ProjectController;

  before(function () {
    controller = new ProjectController(fakeProjectService);
  });

  describe("create", () => {
    it("creates a project", async function () {
      const express = expressMock({ body: {}, baseUrl: "/api/projects", path: "/", locals: {} });
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("create").resolves(fakeProjectModel().findOne({
        where: { id: "id", name: "My project", redirectURL: "http://domain.fr", scope: ["family_name", "email"], creator: "userId" },
      }));
      const setHeader = spy(express.res, "setHeader");
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.create(express.req, express.res, express.next);

      expect(setHeader.calledOnceWithExactly("Location", "/api/projects/id")).to.be.true;
      expect(status.calledOnceWithExactly(201)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", name: "My project", redirectURL: "http://domain.fr", scope: ["family_name", "email"], creator: "userId" }))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to create a project", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("create").rejects(new Error());

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to create a project when a conflict occurs", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("create").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });
  });

  describe("find", () => {
    it("finds a project", async function () {
      const express = expressMock({ params: {} });
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").resolves(fakeProjectModel().findByPk("id"));
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.find(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to find a project", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").rejects(new Error(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to find a project when not found", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").rejects(new EmptyResultError(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });
  });
});
