import { GraphQLError } from "graphql";
import { Product, User, Cart, Order } from "../../models";
import {
  AddProductInterface,
  ContextInterface,
  DeleteProductInterface,
  UpdateProductInterface,
  addCartInterface,
  removeCartInterface,
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
        console.log(getProduct);
        return {
          data: getProduct,
        };
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

          console.log(getProduct);
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

        console.log(newUser);
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
