import { Server } from "http";
import { expect } from "chai";
import sinon, { match } from "sinon";
import sinonTest from "sinon-test";
import * as AuthControllerModule from "../src/controllers/auth.controller";
import * as OAuth2ControllerModule from "../src/controllers/oauth2.controller";
import * as ProjectControllerModule from "../src/controllers/project.controller";
import * as UserControllerModule from "../src/controllers/user.controller";
import * as LoggerModule from "../src/logger";
import * as AuthMiddlewareModule from "../src/middlewares/auth.middleware";
import * as ErrorMiddlewareModule from "../src/middlewares/error.middleware";
import * as PermissionMiddlewareModule from "../src/middlewares/permission.middleware";
import * as ValidationMiddlewareModule from "../src/middlewares/validation.middleware";
import * as ModelModule from "../src/models";
import * as AuthRouterModule from "../src/routers/auth.router";
import * as OAuth2RouterModule from "../src/routers/oauth2.router";
import * as ProjectRouterModule from "../src/routers/project.router";
import * as UserRouterModule from "../src/routers/user.router";
import { OAuth2Server } from "../src/server";
import * as AuthServiceModule from "../src/services/auth.service";
import * as ProjectServiceModule from "../src/services/project.service";
import * as RequestServiceModule from "../src/services/request.service";
import * as UserServiceModule from "../src/services/user.service";
import * as ValidationServiceModule from "../src/services/validation.service";
import { loggerMock } from "./helpers/mocks.helper";

const test = sinonTest(sinon);

describe("OAuth2Server", () => {
  let server: Omit<OAuth2Server, "_server"> & { _server?: Server };
  const fakeDatabase = { connect: () => null, disconnect: () => null };

  before(test(function () {
    this.stub(ModelModule, "OAuth2DatabaseClient").callsFake(() => fakeDatabase);
    this.stub(LoggerModule, "Logger").callsFake(loggerMock);
    this.stub(ValidationServiceModule, "ValidationService").returns(null);
    this.stub(UserServiceModule, "UserService").returns(null);
    this.stub(ProjectServiceModule, "ProjectService").returns(null);
    this.stub(RequestServiceModule, "RequestService").returns(null);
    this.stub(AuthServiceModule, "AuthService").returns(null);
    this.stub(UserControllerModule, "UserController").callsFake(() => null);
    this.stub(AuthControllerModule, "AuthController").callsFake(() => null);
    this.stub(ProjectControllerModule, "ProjectController").callsFake(() => null);
    this.stub(OAuth2ControllerModule, "OAuth2Controller").callsFake(() => null);
    this.stub(AuthMiddlewareModule, "AuthMiddleware").callsFake(() => null);
    this.stub(PermissionMiddlewareModule, "PermissionMiddleware").callsFake(() => null);
    this.stub(ValidationMiddlewareModule, "ValidationMiddleware").callsFake(() => null);
    this.stub(ErrorMiddlewareModule, "ErrorMiddleware").callsFake(() => ({ notFound: () => null, handleError: () => null }));
    this.stub(AuthRouterModule, "AuthRouter").callsFake(() => ({ router: () => null }));
    this.stub(UserRouterModule, "UserRouter").callsFake(() => ({ router: () => null }));
    this.stub(ProjectRouterModule, "ProjectRouter").callsFake(() => ({ router: () => null }));
    this.stub(OAuth2RouterModule, "OAuth2Router").callsFake(() => ({ router: () => null }));
    server = new OAuth2Server() as unknown as Omit<OAuth2Server, "_server"> & { _server: Server };
  }));

  it("starts the server", test(async function() {
    const connect = this.spy(fakeDatabase, "connect");
    this.mock(server.app).expects("listen").withExactArgs(match.number, match.string, match.instanceOf(Function)).once().callsArg(2).returns();

    await server.start();

    expect(connect.calledOnceWithExactly()).to.be.true;
  }));

  it("stops the started server", test(async function () {
    const disconnect = this.spy(fakeDatabase, "disconnect");
    server._server = { close: () => null } as unknown as Server;
    this.mock(server._server).expects("close").withExactArgs(match.instanceOf(Function)).once().callsArg(0).returns();

    await server.stop();

    expect(disconnect.calledOnceWithExactly()).to.be.true;
  }));

  it("does not stop the stopped server", test(async function () {
    const disconnect = this.spy(fakeDatabase, "disconnect");
    delete server._server;

    await server.stop();

    expect(disconnect.calledOnceWithExactly()).to.be.true;
  }));
});
