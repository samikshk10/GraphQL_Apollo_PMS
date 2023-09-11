import { Dialect, Sequelize } from "@sequelize/core";
import dbConfig from "./dbConfig.js";

const { username, password, database, host, dialect, port } =
  dbConfig.development;

const sequelize = new Sequelize(database!, username!, password!, {
  host: host,
  port: +port!,
  dialect: dialect! as Dialect,
});

export default sequelize;
