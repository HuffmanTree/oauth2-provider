import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import faker from "faker";
import sinon from "sinon";
import { OAuth2DatabaseClient } from "../../src/models";
import { ProjectModel } from "../../src/models/project.model";
import { ProjectService } from "../../src/services/project.service";

chai.use(chaiAsPromised);

describe("ProjectService", () => {
  const { project: model } = new OAuth2DatabaseClient({});
  const service = new ProjectService(model);
  let projectModelMock: sinon.SinonMock;
  let projectModelPrototypeMock: sinon.SinonMock;

  beforeEach(() => {
    projectModelMock = sinon.mock(ProjectModel);
    projectModelPrototypeMock = sinon.mock(ProjectModel.prototype);
  });

  afterEach(() => {
    projectModelMock.restore();
    projectModelPrototypeMock.restore();
  });

  it("creates a project", () => {
    const payload = {
      name: faker.name.findName(),
      redirectURL: faker.internet.url(),
      scope: faker.datatype.array().map((i) => i.toString()),
      creator: faker.datatype.uuid(),
    };
    const mockProject = new ProjectModel(payload);

    projectModelMock
      .expects("create")
      .once()
      .withArgs(sinon.match(payload))
      .returns(mockProject);

    const result = service.create(payload);

    projectModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(ProjectModel)
      .and.to.satisfy((project: ProjectModel) => project.equals(mockProject))
      .and.to.have.property("secret")
      .and.to.be.a("string")
      .and.to.match(/^[0-9a-f]+$/)
      .and.to.have.lengthOf(64);
  });

  it("finds a project from its id", () => {
    const id = faker.datatype.uuid();
    const mockProject = new ProjectModel({ id });

    projectModelMock
      .expects("findByPk")
      .once()
      .withArgs(id)
      .returns(mockProject);

    const result = service.findById(id);

    projectModelMock.verify();

    return expect(result)
      .to.eventually.be.instanceOf(ProjectModel)
      .and.to.satisfy((project: ProjectModel) => project.id === id);
  });
});
