import { Login, SignUp, getUsers } from "../Controller/AuthController";
import { AddProduct, GetAllProduct } from "../Controller/ProductController";

export const resolvers = {
  Query: {
    users: getUsers,
    getallproduct: GetAllProduct,
  },
  Mutation: {
    signup: SignUp,
    login: Login,

    addproduct: AddProduct,
  },
};
