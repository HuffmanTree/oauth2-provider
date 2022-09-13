declare module "sequelize-mock" {
  import { Sequelize } from "sequelize";

  const SequelizeMock: typeof Sequelize;

  export default SequelizeMock;
}
