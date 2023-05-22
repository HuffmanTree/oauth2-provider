import { expect } from "chai";
import itParam from "mocha-param";
import { unknownToError } from "../../src/utils";

describe("Utils", () => {
  describe("unknownToError", () => {
    itParam(
      "builds an Error from ${value[0]}",
      [
        ["'undefined'", undefined, ""],
        ["'null'", null, ""],
        ["a string", "hello", "hello"],
        ["an non-null object", { say: "hello" }, "{\"say\":\"hello\"}"],
        ["an Error", new Error("my message"), "my message"],
      ],
      (value) => {
        const sourceValue = value[1];
        const expectedErrorMessage = value[2];
        const err = unknownToError(sourceValue);

        expect(err)
          .to.be.instanceOf(Error)
          .and.to.have.property("message")
          .and.to.be.a("string")
          .and.to.equal(expectedErrorMessage);
      },
    );
  });
});
