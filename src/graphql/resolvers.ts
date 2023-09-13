import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import { Product, User } from "../models";
import {
  AddProductInterface,
  ContextInterface,
  DeleteProductInterface,
  LoginInputInterface,
  SignUpInputInterface,
  UpdateProductInterface,
} from "../interfaces";
import { authenticate } from "../Middleware";
import jwt, { JwtPayload } from "jsonwebtoken";

export const resolvers = {
  Query: {
    //User query
    users: async () => {
      try {
        const users = await User.findAll();
        if (users.length <= 0) {
          throw new GraphQLError("No User Found", {
            extensions: {
              code: "NO_USER",
              http: {
                status: 400,
              },
              message: "No User Found",
            },
          });
        }
        return users;
      } catch (error: any) {
        throw new GraphQLError(error.message || "Internal Server Error", {
          extensions: {
            code: "FAILED ",
            http: {
              status: 400,
            },
          },
        });
      }
    },
    //Product query
    getallproduct: async () => {
      try {
        const getProduct = await Product.findAll({
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName"],
            },
          ],
        });

        if (getProduct.length <= 0) {
          throw new GraphQLError(`Product not found`, {
            extensions: {
              code: "NO_PRODUCT_FOUND",
              http: {
                status: 404,
              },
              message: `No Product Found`,
            },
          });
        }

        console.log(getProduct);
        return getProduct;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getproduct: async (parent: any, args: any, context: ContextInterface) => {
      try {
        if (!context?.token) {
          throw new Error("Authorization Token Missing");
        }

        const tokenData = (await authenticate(context?.token)) as JwtPayload;
        if (tokenData?.user) {
          const getProduct = await Product.findAll({
            where: { user_id: tokenData?.user?.id },
          });

          if (getProduct.length <= 0) {
            throw new GraphQLError("There are no Product for current User", {
              extensions: {
                code: "NO_PRODUCT_FOUND",
                http: { status: 404 },
                message: `No Product for current User`,
              },
            });
          }
          return getProduct;
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    //User Mutation
    signup: async (parents: any, args: { input: SignUpInputInterface }) => {
      const { firstName, lastName, email, password, confirmPassword } =
        args.input;

      if (password.length < 8 || confirmPassword.length < 8) {
        throw new GraphQLError(
          "The password must be of at least 8 characters",
          {
            extensions: {
              code: "INVALID_PASSWORD_FORMAT",
              http: {
                status: 401,
              },
              messsage: `Password must be at least 8 characters`,
            },
          }
        );
      }

      if (password !== confirmPassword) {
        throw new GraphQLError(`Password doesn't match with confirm password`, {
          extensions: {
            code: "INVALID_CPASSWORD",
            http: {
              status: 409,
            },
            message: `Confirm password doesn't match`,
          },
        });
      }
      try {
        const userFind = await User.findOne({ where: { email: email } });

        if (userFind !== null) {
          throw new GraphQLError(`User ${email} already exists`, {
            extensions: {
              code: "EMAIL_EXISTS",
              http: {
                status: 409,
              },
              message: `User ${email} already exists`,
            },
          });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser: any = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });
        return {
          data: newUser,
          message: "Sign up Successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    login: async (parent: any, args: { input: LoginInputInterface }) => {
      const { email, password } = args.input;
      if (password!.length < 8) {
        // throw new Error("The password must be of at least 8 characters");
        throw new GraphQLError(
          "The password must be of at least 8 characters",
          {
            extensions: {
              code: "INVALID_PASSWORD_FORMAT",
              http: {
                status: 401,
              },
              messsage: `Password must be at least 8 characters`,
            },
          }
        );
      }
      try {
        const userFind = await User.findOne({ where: { email: email } });

        if (!userFind) {
          throw new GraphQLError(`User ${email} not found`, {
            extensions: {
              code: "EMAIL_NOT_FOUND",
              http: { status: 404 },
              message: `User ${email} not found`,
            },
          });
        }

        const isValidPassword = await bcrypt.compare(
          password!.toString(),
          userFind.dataValues.password
        );

        if (!isValidPassword) {
          throw new GraphQLError("Incorrect Email or Password", {
            extensions: {
              code: "INCORRECT_EMAIL_PASSWORD",
              http: { status: 401 },
              message: `Incorrect Email or Password`,
            },
          });
        }

        const payload = {
          firstName: userFind.dataValues.firstName,
          lastName: userFind.dataValues.lastName,
          id: userFind.dataValues.id,
          email: userFind.dataValues.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
          expiresIn: "1d",
        });

        return {
          data: userFind,
          token,
          message: "Login Successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    //product Mutation
    addproduct: async (
      parents: any,
      args: { input: AddProductInterface },
      context: ContextInterface
    ) => {
      const { name, price, category } = args.input;

      if (!context?.token) {
        throw new Error("Authorization Token missing");
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const newUser: any = await Product.create({
          name,
          price,
          user_id: tokenData?.user?.id,
          category,
        });
        return {
          message: "Product added successfully",
          user: {},
          data: newUser,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    //deleteproduct
    deleteproduct: async (
      parents: any,
      args: { input: DeleteProductInterface },
      context: ContextInterface
    ) => {
      const { id } = args.input;

      if (!context?.token) {
        throw new Error("Authorization Token missing");
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const ProductDetails = await Product.findOne({ where: { id } });
        if (ProductDetails == null) {
          throw new Error("Product Not Found");
        }

        if (tokenData?.user?.id !== ProductDetails.user_id) {
          throw new GraphQLError("Unauthorized User", {
            extensions: {
              code: "UNAUTHORIZED",
              http: { status: 401 },
            },
          });
        }

        await ProductDetails.destroy();

        console.log(ProductDetails);
        return {
          message: "Product Deleted successfully",
          data: ProductDetails,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    updateproduct: async (
      parents: any,
      args: { input: UpdateProductInterface },
      context: ContextInterface
    ) => {
      const { id, name, price, category } = args.input;

      if (!context?.token) {
        throw new Error("Authorization Token missing");
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const ProductDetails = await Product.findOne({ where: { id } });
        if (ProductDetails == null) {
          throw new Error("Product Not Found");
        }

        if (tokenData?.user?.id !== ProductDetails.user_id) {
          throw new GraphQLError("Unauthorized User", {
            extensions: {
              code: "UNAUTHORIZED",
              http: { status: 401 },
              message: "User is not authorized to Update",
            },
          });
        }

        const newData = {
          name,
          price,
          category,
        };

        console.log(newData);
        const updateProduct = await Product.update(newData, {
          where: { id },
        });

        if (!updateProduct) {
          throw new GraphQLError("Product Update Failed", {
            extensions: {
              code: "PRODUCT_UPDATE_FAILED",
              http: { status: 401 },
              message: "Product update has been failed",
            },
          });
        }
        console.log("this is update Product" + updateProduct);
        return {
          data: { id, ...newData },
          message: "Product Updated successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
