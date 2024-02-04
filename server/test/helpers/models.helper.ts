import { ProjectModel } from "../../src/models/project.model";
import { RequestModel } from "../../src/models/request.model";
import { UserModel } from "../../src/models/user.model";

export function fakeUserModel({
  verifyPasswordReturnedValue,
}: Partial<{
  verifyPasswordReturnedValue: boolean,
}> = {}): typeof UserModel {
  function instance(p?: Partial<UserModel>) {
    return {
      ...p,
      verifyPassword() {
        return !!verifyPasswordReturnedValue;
      },
      update(input: Partial<UserModel>) {
        return { ...this, ...input };
      },
      destroy() { void 0; },
      toJSON() { return this; },
    };
  }
  const model = {
    create(input: Partial<UserModel>) {
      return instance(input);
    },
    findByPk(id: string) {
      return instance({
        id,
      });
    },
    findOne(options: { where: Partial<UserModel> } = { where: {} }) {
      return instance(options.where);
    },
  } as unknown as typeof UserModel;

  return model;
}

export function fakeProjectModel({
  allowRequestReturnedValue,
  verifySecretReturnedValue,
}: Partial<{
  allowRequestReturnedValue: boolean,
  verifySecretReturnedValue: boolean,
}> = {}): typeof ProjectModel {
  function instance(p?: Partial<ProjectModel>) {
    return {
      ...p,
      allowRequest() {
        return !!allowRequestReturnedValue;
      },
      verifySecret() {
        return !!verifySecretReturnedValue;
      },
      update(input: Partial<ProjectModel>) {
        return { ...this, ...input };
      },
      destroy() { void 0; },
      toJSON() { return this; },
      setDataValue() { void 0; },
    };
  }
  const model = {
    create(input: Partial<ProjectModel>) {
      return instance(input);
    },
    findByPk(id: string) {
      return instance({
        id,
      });
    },
    findOne(options: { where: Partial<ProjectModel> } = { where: {} }) {
      return instance(options.where);
    },
  } as unknown as typeof ProjectModel;

  return model;
}

export function fakeRequestModel(): typeof RequestModel {
  function instance(p?: Partial<RequestModel>) {
    return {
      ...p,
      update(input: Partial<RequestModel>) {
        return { ...this, ...input };
      },
      destroy() { void 0; },
      toJSON() { return this; },
    };
  }
  const model = {
    create(input: Partial<RequestModel>) {
      return instance(input);
    },
    findByPk(id: string) {
      return instance({
        id,
      });
    },
    findOne(options: { where: Partial<RequestModel> } = { where: {} }) {
      return instance(options.where);
    },
  } as unknown as typeof RequestModel;

  return model;
}
