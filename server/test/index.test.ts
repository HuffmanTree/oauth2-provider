import { expect } from "chai";

function hello(): string {
  return "Hello mocha !!";
}

describe("Initial test", () => {
  it("returns 'Hello mocha !!'", () => {
    const res = hello();

    expect(res).to.be.a("string").and.to.equal("Hello mocha !!");
  });
});
