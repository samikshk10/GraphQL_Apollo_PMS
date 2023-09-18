import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import { sequelize } from "./config";
import {
  userTypeDefs,
  productTypeDefs,
  orderTypeDefs,
  cartTypeDefs,
} from "./graphql/typeDefs/index";
import {
  authResolvers,
  productResolvers,
  orderResolvers,
  cartResolvers,
} from "./graphql/resolvers/index";
import { context } from "./helpers";
dotenv.config();

const initApp = async () => {
  await sequelize.authenticate();
  console.log("Database Connection has been established successfully");

  const server = new ApolloServer({
    typeDefs: [userTypeDefs, productTypeDefs, orderTypeDefs, cartTypeDefs],
    resolvers: [authResolvers, productResolvers, orderResolvers, cartResolvers],
  });

  const port = +process.env.PORT! || 4100;

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: context,
  });

  console.log(`Server started at Port : ${port} and url: ${url} `);
};

initApp();
