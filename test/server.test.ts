import sinon from "sinon";
import { OAuth2Server } from "../src/server";
import chai, { expect } from "chai";
import { OAuth2DatabaseClient } from "../src/models";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

let service: OAuth2Server;

describe("OAuth2Server", () => {
  let databaseClientPrototypeMock: sinon.SinonMock;
  let expressClientPrototypeMock: sinon.SinonMock;
  let startedServerPrototypeMock: sinon.SinonMock;

  before(() => {
    service = new OAuth2Server({});
  });

  beforeEach(() => {
    databaseClientPrototypeMock = sinon.mock(OAuth2DatabaseClient.prototype);
    expressClientPrototypeMock = sinon.mock(service.app);
  });

  afterEach(() => {
    databaseClientPrototypeMock.restore();
    expressClientPrototypeMock.restore();
    startedServerPrototypeMock.restore();
  });

  it("starts the server ", () => {
    databaseClientPrototypeMock.expects("connect").once().withArgs();

    expressClientPrototypeMock
      .expects("listen")
      .once()
      .withArgs(8080, "localhost")
      .callsArg(2)
      .returns({ close: () => null });

    const processSpy = sinon.spy(process, "on");
    const result = service.start();

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      expect(processSpy.calledOnceWith("SIGINT")).to.be.true;

      databaseClientPrototypeMock.verify();
      expressClientPrototypeMock.verify();

      startedServerPrototypeMock = sinon.mock(service._server);

      processSpy.restore();

      return true;
    });
  });

  it("stops the started server", () => {
    databaseClientPrototypeMock.expects("disconnect").once().withArgs();
    startedServerPrototypeMock.expects("close").once().withArgs().callsArg(0);

    const result = service.stop();

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      databaseClientPrototypeMock.verify();
      startedServerPrototypeMock.verify();

      return true;
    });
  });

  it("does not stop the stopped server", () => {
    const service = new OAuth2Server({});

    databaseClientPrototypeMock.expects("disconnect").once().withArgs();

    const result = service.stop();

    return expect(result).to.eventually.be.undefined.and.to.satisfy(() => {
      databaseClientPrototypeMock.verify();

      return true;
    });
  });
});
