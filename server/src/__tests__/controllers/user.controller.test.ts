import { expect } from "chai";
import { EmptyResultError, UniqueConstraintError, ValidationErrorItem } from "sequelize";
import { match, spy, mock } from "sinon";
import { UserController } from "../../controllers/user.controller.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeUserModel } from "../helpers/models.helper.js";
import { fakeUserService } from "../helpers/services.helper.js";

describe("UserController", () => {
  let controller: UserController;

  before(function () {
    controller = new UserController(fakeUserService);
  });

  describe("create", () => {
    it("creates a user", async function () {
      const express = expressMock({ body: {}, baseUrl: "/api/users", path: "/" });
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("create").returns(fakeUserModel().findOne({
        where: { id: "id", givenName: "user", email: "user@domain.fr", password: "secret" },
        rejectOnEmpty: true,
      }));
      const setHeader = spy(express.res, "setHeader");
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.create(express.req, express.res, express.next);

      expect(setHeader.calledOnceWithExactly("Location", "/api/users/id")).to.be.true;
      expect(status.calledOnceWithExactly(201)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", givenName: "user", email: "user@domain.fr" }))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to create a user", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("create").rejects(new Error());

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to create a user when a conflict occurs", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("create").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));

      await controller.create(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });
  });

  describe("find", () => {
    it("finds a user", async function () {
      const express = expressMock({ params: {} });
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").returns(fakeUserModel().findByPk("id", { rejectOnEmpty: true }));
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.find(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to find a user", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new Error(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to find a user when not found", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new EmptyResultError(""));

      await controller.find(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });
  });

  describe("update", () => {
    it("updates a user", async function () {
      const express = expressMock({ params: {}, body: {} });
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").returns(fakeUserModel().findByPk("id", { rejectOnEmpty: true }));
      fakeUserServiceMock.expects("update").returns(fakeUserModel().findOne({ where: { id: "id", givenName: "user" }, rejectOnEmpty: true }));
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.update(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id", givenName: "user" }))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to update a user", async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new Error(""));

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to update a user when not found", async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new EmptyResultError(""));

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to update a user when a conflict occurs", async function () {
      const express = expressMock({ params: {}, body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").returns(fakeUserModel().findOne({ rejectOnEmpty: true }));
      fakeUserServiceMock.expects("update").rejects(new UniqueConstraintError({ errors: [{ message: "error message" } as ValidationErrorItem] }));

      await controller.update(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });
  });

  describe("destroy", () => {
    it("destroys a user", async function () {
      const express = expressMock({ params: {} });
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").returns(fakeUserModel().findByPk("id", { rejectOnEmpty: true }));
      fakeUserServiceMock.expects("destroy").resolves();
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.destroy(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ deleted: "id" })).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to destroy a user", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new Error(""));

      await controller.destroy(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to destroy a user when not found", async function () {
      const express = expressMock({ params: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findById").rejects(new EmptyResultError(""));

      await controller.destroy(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });
  });
});
