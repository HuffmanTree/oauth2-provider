import { expect } from "chai";
import { EmptyResultError } from "sequelize";
import { match, spy, mock } from "sinon";
import { OAuth2Controller } from "../../controllers/oauth2.controller.js";
import { expressMock } from "../helpers/mocks.helper.js";
import { fakeProjectModel, fakeRequestModel, fakeUserModel } from "../helpers/models.helper.js";
import { fakeAuthService, fakeProjectService, fakeRequestService, fakeUserService } from "../helpers/services.helper.js";

describe("OAuth2Controller", () => {
  let controller: OAuth2Controller;

  before(function () {
    controller = new OAuth2Controller(fakeProjectService, fakeRequestService, fakeUserService, fakeAuthService);
  });

  describe("authorize", () => {
    it("computes an oauth2 authorization code", async function () {
      const express = expressMock({ query: { redirect_uri: "http://localhost:8080", scope: "" }, locals: {} });
      const project = await fakeProjectModel({ allowRequestReturnedValue: true }).findOne();
      const fakeProjectServiceMock = mock(fakeProjectService);
      const fakeRequestServiceMock = mock(fakeRequestService);
      fakeProjectServiceMock.expects("findById").resolves(project);
      fakeRequestServiceMock.expects("create").resolves(fakeRequestModel().findOne({ where: { code: "the_code"} }));
      const redirect = spy(express.res, "redirect");

      await controller.authorize(express.req, express.res, express.next);

      expect(redirect.calledOnceWith("http://localhost:8080?code=the_code")).to.be.true;
      fakeProjectServiceMock.restore();
      fakeRequestServiceMock.restore();
    });

    it("fails to compute an authorization code with an invalid client id", async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").rejects(new EmptyResultError(""));
      const next = spy(express, "next");

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to compute an authorization code with a disallowed request", async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      const project = await fakeProjectModel({ allowRequestReturnedValue: false }).findOne();
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").resolves(project);
      const next = spy(express, "next");

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to compute an authorization code with another reason", async function () {
      const express = expressMock({ query: { scope: "" }, locals: {} });
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").rejects(new Error());
      const next = spy(express, "next");

      await controller.authorize(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });
  });

  describe("token", () => {
    it("computes an oauth2 access token", async function () {
      const express = expressMock({ body: {} });
      const project = await fakeProjectModel({ verifySecretReturnedValue: true }).findOne();
      const fakeProjectServiceMock = mock(fakeProjectService);
      const fakeRequestServiceMock = mock(fakeRequestService);
      fakeProjectServiceMock.expects("findById").resolves(project);
      fakeRequestServiceMock.expects("findByClientIdAndCode").resolves(fakeRequestModel().findOne({ where: { scope: ["given_name"] } }));
      fakeRequestServiceMock.expects("token").resolves(fakeRequestModel().findOne({ where: { token: "token" } }));
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.token(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly({ access_token: "token", token_type: "Bearer", expires_in: 3600 })).to.be.true;
      fakeProjectServiceMock.restore();
      fakeRequestServiceMock.restore();
    });

    it("fails to compute an oauth2 access token from a previously used token", async function () {
      const express = expressMock({ body: {} });
      const project = await fakeProjectModel({ verifySecretReturnedValue: true }).findOne();
      const fakeProjectServiceMock = mock(fakeProjectService);
      const fakeRequestServiceMock = mock(fakeRequestService);
      fakeProjectServiceMock.expects("findById").resolves(project);
      fakeRequestServiceMock.expects("findByClientIdAndCode").resolves(fakeRequestModel().findOne({ where: { token: "token" } }));
      const next = spy(express, "next");

      await controller.token(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
      fakeRequestServiceMock.restore();
    });

    it("fails to compute an oauth2 access token with a wrong secret", async function () {
      const express = expressMock({ body: {} });
      const project = await fakeProjectModel({ verifySecretReturnedValue: false }).findOne();
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").resolves(project);
      const next = spy(express, "next");

      await controller.token(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });

    it("fails to compute an oauth2 access token with another reason", async function () {
      const express = expressMock({ body: {} });
      const fakeProjectServiceMock = mock(fakeProjectService);
      fakeProjectServiceMock.expects("findById").rejects(new Error());
      const next = spy(express, "next");

      await controller.token(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeProjectServiceMock.restore();
    });
  });

  describe("info", () => {
    it("finds a user from an oauth2 access token", async function () {
      const express = expressMock();
      const fakeRequestServiceMock = mock(fakeRequestService);
      const fakeUserServiceMock = mock(fakeUserService);
      fakeRequestServiceMock.expects("findByToken").resolves(fakeRequestModel().findOne({ where: { token: "token", scope: ["given_name"] } }));
      fakeUserServiceMock.expects("findById").resolves(fakeUserModel().findByPk("id"));
      const status = spy(express.res, "status");
      const json = spy(express.res, "json");

      await controller.info(express.req, express.res, express.next);

      expect(status.calledOnceWithExactly(200)).to.be.true;
      expect(json.calledOnceWithExactly(match({ id: "id" }))).to.be.true;
      fakeRequestServiceMock.restore();
      fakeUserServiceMock.restore();
    });

    it("fails to find a user from an invalid access token", async function () {
      const express = expressMock();
      const fakeRequestServiceMock = mock(fakeRequestService);
      fakeRequestServiceMock.expects("findByToken").rejects(new EmptyResultError(""));
      const next = spy(express, "next");

      await controller.info(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeRequestServiceMock.restore();
    });

    it("fails to find a user from an oauth2 token with another reason", async function () {
      const express = expressMock();
      const fakeRequestServiceMock = mock(fakeRequestService);
      fakeRequestServiceMock.expects("findByToken").rejects(new Error(""));
      const next = spy(express, "next");

      await controller.info(express.req, express.res, express.next);

      expect(next.calledOnceWithExactly(match.instanceOf(Error))).to.be.true;
      fakeRequestServiceMock.restore();
    });
  });
});
