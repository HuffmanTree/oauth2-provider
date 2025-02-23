import { expect } from "chai";
import jwt from "jsonwebtoken";
import { mock, spy } from "sinon";
import { AuthService } from "../../services/auth.service.js";
import { fakeUserModel } from "../helpers/models.helper.js";

describe("AuthService", () => {
  let service: AuthService;

  before(function () {
    service = new AuthService();
  });

  describe("login", () => {
    it("logs a user in with a valid password", async function () {
      const user = await fakeUserModel({ verifyPasswordReturnedValue: true }).findOne({ rejectOnEmpty: true });
      const verifyPassword = spy(user, "verifyPassword");
      const jwtMock = mock(jwt);
      jwtMock.expects("sign").once().returns("jwt");

      const result = await service.login(user, "secret");

      expect(verifyPassword.calledOnceWithExactly("secret")).to.be.true;
      expect(result).to.equal("jwt");
      verifyPassword.restore();
      jwtMock.restore();
    });

    it("fails to log user in with an invalid password", async function () {
      const user = await fakeUserModel({ verifyPasswordReturnedValue: false }).findOne({ rejectOnEmpty: true });
      const verifyPassword = spy(user, "verifyPassword");

      const result = service.login(user, "secret");

      expect(verifyPassword.calledOnceWithExactly("secret")).to.be.true;
      await result.then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
      verifyPassword.restore();
    });
  });

  describe("verify", () => {
    it("verifies a token", async function () {
      const jwtMock = mock(jwt);
      jwtMock.expects("verify").once().returns({ sub: "userId" });

      const result = await service.verify("jwt");

      expect(result).to.equal("userId");
      jwtMock.restore();
    });

    it("verifies a token with a warning", async function () {
      const jwtMock = mock(jwt);
      jwtMock.expects("verify").once().returns("userId");

      const result = await service.verify("jwt");

      expect(result).to.equal("userId");
      jwtMock.restore();
    });
  });
});
