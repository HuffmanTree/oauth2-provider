import SequelizeMock from "sequelize-mock";
import { ProjectModel } from "../../src/models/project.model";
import { RequestModel } from "../../src/models/request.model";
import { UserModel } from "../../src/models/user.model";

function modelDefaultValues(attributes: Array<string>) {
  const res = {};

  for (const attribute of attributes)
    res[attribute] = `default-${attribute.charAt(0).toUpperCase()}${attribute.slice(1)}`;

  return res;
}

export function fakeUserModel({
  verifyPasswordReturnedValue,
}: Partial<{
  verifyPasswordReturnedValue: boolean,
}> = {}): typeof UserModel {
  const sequelize = new SequelizeMock();
  const model = sequelize.define("user", modelDefaultValues(["id", "email", "password", "givenName", "familyName"]), {
    instanceMethods: {
      verifyPassword() {
        if (typeof verifyPasswordReturnedValue !== "boolean") throw new Error("Missing 'verifyPasswordReturnedValue' to mock 'verifyPassword' method");

        return verifyPasswordReturnedValue;
      },
    },
  });

  /**
   * Method `findByPk` has not been implemented by `sequelize-mock` that still uses the old `findById`
   * This line simply aliases `findByPk` to `findById`
   * {@link https://github.com/BlinkUX/sequelize-mock/issues/71}
   */
  model.findByPk = model.findById.bind(model);

  return model;
}

export function fakeProjectModel({
  allowRequestReturnedValue,
  verifySecretReturnedValue,
}: Partial<{
  allowRequestReturnedValue: boolean,
  verifySecretReturnedValue: boolean,
}> = {}): typeof ProjectModel {
  const sequelize = new SequelizeMock();
  const model = sequelize.define("project", modelDefaultValues(["id", "secret", "name", "redirectURL", "scope", "creator"]), {
    instanceMethods: {
      allowRequest() {
        if (typeof allowRequestReturnedValue !== "boolean") throw new Error("Missing 'allowRequestReturnedValue' to mock 'allowRequest' method");

        return allowRequestReturnedValue;
      },
      verifySecret() {
        if (typeof verifySecretReturnedValue !== "boolean") throw new Error("Missing 'verifySecretReturnedValue' to mock 'verifySecret' method");

        return verifySecretReturnedValue;
      },
      setDataValue(key: string, value: unknown) {
        this[key] = value;
      },
    },
  });

  /**
   * Method `findByPk` has not been implemented by `sequelize-mock` that still uses the old `findById`
   * This line simply aliases `findByPk` to `findById`
   * {@link https://github.com/BlinkUX/sequelize-mock/issues/71}
   */
  model.findByPk = model.findById.bind(model);

  return model;
}

export function fakeRequestModel(): typeof RequestModel {
  const sequelize = new SequelizeMock();
  const model = sequelize.define("request", modelDefaultValues(["id", "resourceOwner", "clientId", "scope", "code", "token"]));

  /**
   * Method `findByPk` has not been implemented by `sequelize-mock` that still uses the old `findById`
   * This line simply aliases `findByPk` to `findById`
   * {@link https://github.com/BlinkUX/sequelize-mock/issues/71}
   */
  model.findByPk = model.findById.bind(model);

  return model;
}
