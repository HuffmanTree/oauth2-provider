import { expect } from "chai";
import { EmptyResultError, UniqueConstraintError, ValidationErrorItem } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import { UserController } from "../../src/controllers/user.controller";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";
import { fakeUserModel } from "../helpers/models.helper";
import { fakeUserService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("UserController", () => {
  let controller: UserController;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    controller = new UserController(fakeUserService);
  }));

  describe("create", () => {
    it("creates a user", test(async function () {
      const express = expressMock({ body: {}, baseUrl: "/api/users", path: "/" });
      this.stub(fakeUserService, "create").resolves(fakeUserModel().findOne({
        where: { id: "id", givenName: "user", email: "user@domain.fr", password: "secret" },
      }));
      const setHeader = this.spy(express.res, "setHeader");
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.create(express.req, express.res, express.next);

      expect(setHeader.calledOnceWithExactly("Location", "/api/users/id")).to.be.true;
      expect(status.calledOnceWithExactly(201)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", givenName: "user", email: "user@domain.fr" }))).to.be.true;
    }));

    it("fails to create a user", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "create").rejects(new Error());

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to create a user when a conflict occurs", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "create").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));
      this.stub(ErrorModule, "Conflict").callsFake(errorMock.Conflict);

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("find", () => {
    it("finds a user", test(async function () {
      const express = expressMock({ params: {} });
      this.stub(fakeUserService, "findById").resolves(fakeUserModel().findByPk("id"));
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.find(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
    }));

    it("fails to find a user", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new Error(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to find a user when not found", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new EmptyResultError(""));
      this.stub(ErrorModule, "NotFound").callsFake(errorMock.NotFound);

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("update", () => {
    it("updates a user", test(async function () {
      const express = expressMock({ params: {}, body: {} });
      this.stub(fakeUserService, "findById").resolves(fakeUserModel().findByPk("id"));
      this.stub(fakeUserService, "update").resolves(fakeUserModel().findOne({ where: { id: "id", givenName: "user" } }));
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.update(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", givenName: "user" }))).to.be.true;
    }));

    it("fails to update a user", test(async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new Error());

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to update a user when not found", test(async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new EmptyResultError(""));
      this.stub(ErrorModule, "NotFound").callsFake(errorMock.NotFound);

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to update a user when a conflict occurs", test(async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").resolves(fakeUserModel().findOne());
      this.stub(fakeUserService, "update").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));
      this.stub(ErrorModule, "Conflict").callsFake(errorMock.Conflict);

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("destroy", () => {
    it("destroys a user", test(async function () {
      const express = expressMock({ params: {} });
      this.stub(fakeUserService, "findById").resolves(fakeUserModel().findByPk("id"));
      this.stub(fakeUserService, "destroy").resolves();
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.destroy(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ deleted: "id" })).to.be.true;
    }));

    it("fails to destroy a user", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new Error(""));

      await controller.destroy(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to destroy a user when not found", test(async function () {
      const express = expressMock({ params: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findById").rejects(new EmptyResultError(""));
      this.stub(ErrorModule, "NotFound").callsFake(errorMock.NotFound);

      await controller.destroy(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
