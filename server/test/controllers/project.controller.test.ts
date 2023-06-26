import { expect } from "chai";
import { EmptyResultError, UniqueConstraintError, ValidationErrorItem } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import { ProjectController } from "../../src/controllers/project.controller";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";
import { fakeProjectModel } from "../helpers/models.helper";
import { fakeProjectService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("ProjectController", () => {
  let controller: ProjectController;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    controller = new ProjectController(fakeProjectService);
  }));

  describe("create", () => {
    it("creates a project", test(async function () {
      const express = expressMock({ body: {}, baseUrl: "/api/projects", path: "/", locals: {} });
      this.stub(fakeProjectService, "create").resolves(fakeProjectModel().findOne({
        where: { id: "id", name: "My project", redirectURL: "http://domain.fr", scope: ["name", "email"], creator: "userId" },
      }));
      const setHeader = this.spy(express.res, "setHeader");
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.create(express.req, express.res, express.next);

      expect(setHeader.calledOnceWithExactly("Location", "/api/projects/id")).to.be.true;
      expect(status.calledOnceWithExactly(201)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", name: "My project", redirectURL: "http://domain.fr", scope: ["name", "email"], creator: "userId" }))).to.be.true;
    }));

    it("fails to create a project", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeProjectService, "create").rejects(new Error());

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to create a project when a conflict occurs", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeProjectService, "create").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));
      this.stub(ErrorModule, "Conflict").callsFake(errorMock.Conflict);

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("find", () => {
    it("finds a project", test(async function () {
      const express = expressMock({ params: {} });
      this.stub(fakeProjectService, "findById").resolves(fakeProjectModel().findByPk("id"));
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.find(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
    }));

    it("fails to find a project", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeProjectService, "findById").rejects(new Error(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to find a project when not found", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeProjectService, "findById").rejects(new EmptyResultError(""));
      this.stub(ErrorModule, "NotFound").callsFake(errorMock.NotFound);

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
