import { expect } from "chai";
import { Scope } from "../../models/user.model.js";
import { ValidationService } from "../../services/validation.service.js";

describe("ValidationService", () => {
  let service: ValidationService;

  before(function () {
    service = new ValidationService();
  });

  describe("validates", () => {
    it("validates data against a schema", async function () {
      expect(await service.validate<string>("data", { type: "string" })).to.equal("data");
      expect(await service.validate<string>("profile", { type: "string", enum: Object.values(Scope) })).to.equal("profile");
    });

    it("fails to validate data against a schema", async function () {
      await service.validate<string>(42, { type: "string" })
        .then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
      await service.validate<string>("other", { type: "string", enum: Object.values(Scope) })
        .then(() => ({}), (err) => expect(err).to.be.instanceOf(Error));
    });
  });
});
