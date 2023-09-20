import { GraphQLError } from "graphql";
import { Product, User, Cart, Order } from "../../models";
import {
  AddProductInterface,
  ContextInterface,
  DeleteProductInterface,
  UpdateProductInterface,
} from "../../interfaces";
import { authenticate } from "../../Middleware";
import { JwtPayload } from "jsonwebtoken";

export const productResolvers = {
  Query: {
    //Product query
    getallproduct: async () => {
      try {
        const getProduct = await Product.findAll({
          include: [
            {
              model: User,
              as: "user",
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
        return {
          data: getProduct,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    getproduct: async (
      parent: ParentNode,
      args: any,
      context: ContextInterface
    ) => {
      try {
        if (!context?.token) {
          throw new GraphQLError("Authorization Token Missing", {
            extensions: {
              code: "AUTHORIZATION_FAILED",
              http: { status: 401 },
              message: `Authorization Token Missing`,
            },
          });
        }

        const tokenData = (await authenticate(context?.token)) as JwtPayload;
        if (tokenData?.data) {
          const getProduct = await Product.findAll({
            where: { user_id: tokenData?.data?.id },
            include: [
              {
                model: User,
                as: "user",
              },
            ],
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

          return {
            data: getProduct,
          };
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    //product Mutation
    addproduct: async (
      parents: ParentNode,
      args: { input: AddProductInterface },
      context: ContextInterface
    ) => {
      const { name, price, category } = args.input;

      if (!context?.token) {
        throw new GraphQLError("Authorization Token Missing", {
          extensions: {
            code: "AUTHORIZATION_FAILED",
            http: { status: 401 },
            message: `Authorization Token Missing`,
          },
        });
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const newUser = await Product.create({
          name,
          price,
          userId: tokenData?.data?.id,
          category,
        });

        return {
          data: newUser,
          message: "Product added successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    //deleteproduct
    deleteproduct: async (
      parents: ParentNode,
      args: { input: DeleteProductInterface },
      context: ContextInterface
    ) => {
      const { id } = args.input;

      if (!context?.token) {
        throw new GraphQLError("Authorization Token Missing", {
          extensions: {
            code: "AUTHORIZATION_FAILED",
            http: { status: 401 },
            message: `Authorization Token Missing`,
          },
        });
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const ProductDetails = await Product.findOne({ where: { id } });
        if (ProductDetails == null) {
          throw new GraphQLError("Product Not Found", {
            extensions: {
              code: "PRODUCT_NOT_FOUND",
              http: { status: 404 },
              message: `Product is Not found for given ID`,
            },
          });
        }

        if (tokenData?.data?.id !== ProductDetails.user_id) {
          throw new GraphQLError("Unauthorized User", {
            extensions: {
              code: "UNAUTHORIZED",
              http: { status: 401 },
            },
          });
        }

        await ProductDetails.destroy();

        return {
          message: "Product Deleted successfully",
          data: ProductDetails,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    updateproduct: async (
      parents: ParentNode,
      args: { input: UpdateProductInterface },
      context: ContextInterface
    ) => {
      const { id, name, price, category } = args.input;

      if (!context?.token) {
        throw new GraphQLError("Authorization Token Missing", {
          extensions: {
            code: "AUTHORIZATION_FAILED",
            http: { status: 401 },
            message: `Authorization Token Missing`,
          },
        });
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const ProductDetails = await Product.findOne({ where: { id } });
        if (ProductDetails == null) {
          throw new Error("Product Not Found");
        }

        if (tokenData?.data?.id !== ProductDetails.user_id) {
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
