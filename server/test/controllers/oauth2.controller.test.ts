import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import { OAuth2Controller } from "../../src/controllers/oauth2.controller";
import * as LoggerModule from "../../src/logger";
import * as ErrorModule from "../../src/middlewares/error.middleware";
import { expressMock, loggerMock, errorMock } from "../helpers/mocks.helper";
import { fakeProjectModel, fakeRequestModel, fakeUserModel } from "../helpers/models.helper";
import { fakeProjectService, fakeRequestService, fakeUserService } from "../helpers/services.helper";

const test = sinonTest(sinon);

describe("OAuth2Controller", () => {
  let controller: OAuth2Controller;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    controller = new OAuth2Controller(fakeProjectService, fakeRequestService, fakeUserService);
  }));

  describe("authorize", () => {
    it("computes an oauth2 authorization code", test(async function () {
      const express = expressMock({ query: { redirect_uri: "http://localhost:8080", scope: "" }, locals: {} });
      const project = await fakeProjectModel({ allowRequestReturnedValue: true }).findOne();
      this.stub(fakeProjectService, "findById").resolves(project);
      this.stub(fakeRequestService, "create").resolves(fakeRequestModel().findOne({ where: { code: "the_code"} }));
      const redirect = this.spy(express.res, "redirect");

      await controller.authorize(express.req, express.res, express.next);

      expect(redirect.calledOnceWithExactly("http://localhost:8080?code=the_code")).to.be.true;
    }));

    it("fails to compute an authorization code with an invalid client id", test(async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      this.stub(fakeProjectService, "findById").rejects(new EmptyResultError(""));
      const next = this.spy(express, "next");
      this.stub(ErrorModule, "Forbidden").callsFake(errorMock.Forbidden);

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to compute an authorization code with a disallowed request", test(async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      const project = await fakeProjectModel({ allowRequestReturnedValue: false }).findOne();
      this.stub(fakeProjectService, "findById").resolves(project);
      const next = this.spy(express, "next");
      this.stub(ErrorModule, "Forbidden").callsFake(errorMock.Forbidden);

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to compute an authorization code with another reason", test(async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      this.stub(fakeProjectService, "findById").rejects(new Error());
      const next = this.spy(express, "next");

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("token", () => {
    it("computes an oauth2 access token", test(async function () {
      const express = expressMock({ body: {} });
      const project = await fakeProjectModel({ verifySecretReturnedValue: true }).findOne();
      this.stub(fakeProjectService, "findById").resolves(project);
      this.stub(fakeRequestService, "findByClientIdAndCode").resolves(fakeRequestModel().findOne());
      this.stub(fakeRequestService, "token").resolves(fakeRequestModel().findOne({ where: { token: "token" } }));
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.token(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ access_token: "token", token_type: "Bearer" })).to.be.true;
    }));

    it("fails to compute an oauth2 access token with a wrong secret", test(async function () {
      const express = expressMock({ body: {} });
      const project = await fakeProjectModel({ verifySecretReturnedValue: false }).findOne();
      this.stub(fakeProjectService, "findById").resolves(project);
      const next = this.spy(express, "next");
      this.stub(ErrorModule, "Forbidden").callsFake(errorMock.Forbidden);

      await controller.token(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to compute an oauth2 access token with another reasion", test(async function () {
      const express = expressMock({ body: {} });
      this.stub(fakeProjectService, "findById").rejects(new Error());
      const next = this.spy(express, "next");

      await controller.token(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });

  describe("info", () => {
    it("finds a user from an oauth2 access token", test(async function () {
      const express = expressMock();
      this.stub(fakeRequestService, "findByToken").resolves(fakeRequestModel().findOne({ where: { token: "token" } }));
      this.stub(fakeUserService, "findById").resolves(fakeUserModel().findByPk("id"));
      const status = this.spy(express.res, "status");
      const json = this.spy(express.res, "json");

      await controller.info(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
    }));

    it("fails to find a user from an invalid access token", test(async function () {
      const express = expressMock();
      this.stub(fakeRequestService, "findByToken").rejects(new EmptyResultError(""));
      const next = this.spy(express, "next");
      this.stub(ErrorModule, "Forbidden").callsFake(errorMock.Forbidden);

      await controller.info(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));

    it("fails to find a user from an oauth2 token with another reason", test(async function () {
      const express = expressMock();
      this.stub(fakeRequestService, "findByToken").rejects(new Error(""));
      const next = this.spy(express, "next");

      await controller.info(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
    }));
  });
});
