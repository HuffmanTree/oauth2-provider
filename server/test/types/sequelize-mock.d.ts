declare module "sequelize-mock" {
  import { Sequelize } from "sequelize";

  class SequelizeMock extends Sequelize {
    public abstract define(modelName: string, values: object, options?: object);
  }

  export default SequelizeMock;
}
