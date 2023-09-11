import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import { sequelize } from "./config";
import { typeDefs, resolvers } from "./graphql";

dotenv.config();

const initApp = async () => {
  await sequelize.authenticate();
  console.log("Database Connection has been established successfully");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const port = +process.env.PORT! || 4100;

  const { url } = await startStandaloneServer(server, {
    listen: { port },
  });

  console.log(`Server started at Port : ${port} and url: ${url} `);
};

initApp();
