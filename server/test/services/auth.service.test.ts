import fs from "fs";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import sinon from "sinon";
import sinonTest from "sinon-test";
import * as LoggerModule from "../../src/logger";
import { AuthService } from "../../src/services/auth.service";
import { loggerMock } from "../helpers/mocks.helper";
import { fakeUserModel } from "../helpers/models.helper";

const test = sinonTest(sinon);

describe("AuthService", () => {
  let service: AuthService;

  before(test(function () {
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    this.stub(fs, "readFileSync").callsFake();
    service = new AuthService();
  }));

  describe("login", () => {
    it("logs a user in with a valid password", test(async function () {
      const user = await fakeUserModel({ verifyPasswordReturnedValue: true }).findOne({ rejectOnEmpty: true });
      const verifyPassword = this.spy(user, "verifyPassword");
      const jwtMock = this.mock(jwt);
      jwtMock.expects("sign").once().returns("jwt");

      const result = await service.login(user, "secret");

      expect(verifyPassword.calledOnceWithExactly("secret")).to.be.true;
      expect(result).to.equal("jwt");
    }));

    it("fails to log user in with an invalid password", test(async function () {
      const user = await fakeUserModel({ verifyPasswordReturnedValue: false }).findOne({ rejectOnEmpty: true });
      const verifyPassword = this.spy(user, "verifyPassword");

      const result = service.login(user, "secret");

      expect(verifyPassword.calledOnceWithExactly("secret")).to.be.true;
      await result.then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
    }));
  });

  describe("verify", () => {
    it("verifies a token", test(async function () {
      const jwtMock = this.mock(jwt);
      jwtMock.expects("verify").once().returns({ id: "userId" });

      const result = await service.verify("jwt");

      expect(result).to.equal("userId");
    }));

    it("verifies a token with a warning", test(async function () {
      const jwtMock = this.mock(jwt);
      jwtMock.expects("verify").once().returns("userId");

      const result = await service.verify("jwt");

      expect(result).to.equal("userId");
    }));
  });
});
