import { expect } from "chai";
import { unknownToError } from "../../src/utils";

describe("Utils", () => {
  describe("unknownToError", () => {
    [
      { state: "'undefined'", errorInput: undefined, expectedErrorMessage: "" },
      { state: "'null'", errorInput: null, expectedErrorMessage: ""},
      { state: "a string", errorInput: "hello", expectedErrorMessage:"hello"},
      { state: "an non-null object",errorInput: { say: "hello" }, expectedErrorMessage:"{\"say\":\"hello\"}"},
      { state:"an Error", errorInput:new Error("my message"), expectedErrorMessage:"my message"},
    ].forEach(({ state, errorInput, expectedErrorMessage }) =>
      it(`builds an Error from ${state}`, function () {
        const err = unknownToError(errorInput);

        expect(err)
          .to.be.instanceOf(Error)
          .and.to.have.property("message")
          .and.to.be.a("string")
          .and.to.equal(expectedErrorMessage);
      }));
  });
});
