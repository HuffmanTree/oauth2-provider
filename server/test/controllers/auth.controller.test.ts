import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import { AuthController } from "../../src/controllers/auth.controller";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { loggerMock, expressMock, errorMock } from "../helpers/mocks.helper";
import { fakeUserModel } from "../helpers/models.helper";
import { fakeAuthService, fakeUserService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("AuthController", () => {
  let controller: AuthController;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    controller = new AuthController(fakeUserService, fakeAuthService);
  }));

  describe("login", () => {
    it("logs a user in", test(async function () {
      const express = expressMock({ body: {} });
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");
      this.stub(fakeUserService, "findByEmail").resolves(fakeUserModel().findOne({ where: { id: "id", email: "user@domain.fr" } }));
      this.stub(fakeAuthService, "login").resolves("jwt");

      await controller.login(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ message: "Logged in as id", token: "jwt" })).to.be.true;
    }));

    it("fails to log a user in with an unregistered email", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findByEmail").rejects(new EmptyResultError(""));
      this.stub(ErrorModule, "Unauthorized").callsFake(errorMock.Unauthorized);

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to log a user in with an wrong password", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findByEmail").resolves(fakeUserModel().findOne());
      this.stub(fakeAuthService, "login").rejects(new Error("Invalid password"));
      this.stub(ErrorModule, "Unauthorized").callsFake(errorMock.Unauthorized);

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to log a user in with another reason", test(async function () {
      const express = expressMock({ body: {} });
      const next = this.spy(express, "next");
      this.stub(fakeUserService, "findByEmail").rejects(new Error("Unknown error"));

      await controller.login(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
