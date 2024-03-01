import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import { match, spy, mock } from "sinon";
import { AuthController } from "../../controllers/auth.controller.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeUserModel } from "../helpers/models.helper.js";
import { fakeAuthService, fakeUserService } from "../helpers/services.helper.js";

describe("AuthController", () => {
  let controller: AuthController;

  before(function () {
    controller = new AuthController(fakeUserService, fakeAuthService);
  });

  describe("login", () => {
    it("logs a user in", async function () {
      const express = expressMock({ body: {} });
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");
      const fakeUserServiceMock = mock(fakeUserService);
      const fakeAuthServiceMock = mock(fakeAuthService);
      fakeUserServiceMock.expects("findByEmail").returns(fakeUserModel().findOne({ where: { id: "id", email: "user@domain.fr" }, rejectOnEmpty: true }));
      fakeAuthServiceMock.expects("login").resolves("jwt");

      await controller.login(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ message: "Logged in as id", token: "jwt" })).to.be.true;
      fakeUserServiceMock.restore();
      fakeAuthServiceMock.restore();
    });

    it("fails to log a user in with an unregistered email", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findByEmail").rejects(new EmptyResultError(""));

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });

    it("fails to log a user in with an wrong password", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      const fakeAuthServiceMock = mock(fakeAuthService);
      fakeUserServiceMock.expects("findByEmail").returns(fakeUserModel().findOne({ rejectOnEmpty: true }));
      fakeAuthServiceMock.expects("login").rejects(new Error("Invalid password"));

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
      fakeAuthServiceMock.restore();
    });

    it("fails to log a user in with another reason", async function () {
      const express = expressMock({ body: {} });
      const next = spy(express, "next");
      const fakeUserServiceMock = mock(fakeUserService);
      fakeUserServiceMock.expects("findByEmail").rejects(new Error("Unknown error"));

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeUserServiceMock.restore();
    });
  });
});
