import { Login, SignUp, getUsers } from "../Controller/AuthController";

export const resolvers = {
  Query: {
    users: getUsers,
  },
  Mutation: {
    signup: SignUp,
    login: Login,
  },
};
