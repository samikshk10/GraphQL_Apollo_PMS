import { GraphQLError } from "graphql";
import { Product, User, Cart } from "../../models";
import {
  ContextInterface,
  addCartInterface,
  removeCartInterface,
} from "../../interfaces";
import { authenticate } from "../../Middleware";
import { JwtPayload } from "jsonwebtoken";

export const cartResolvers = {
  Query: {
    getcart: async (
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
          const getcart = await Cart.findAll({
            where: { userId: tokenData?.data?.id },
            include: [
              {
                model: Product,
                as: "product",
                include: [
                  {
                    model: User,
                    as: "user",
                  },
                ],
              },
            ],
          });

          if (getcart.length <= 0) {
            throw new GraphQLError(
              "There are no item in cart for current User",
              {
                extensions: {
                  code: "NO_CART_ITEM_FOUND",
                  http: { status: 404 },
                  message: `No cart item for current User`,
                },
              }
            );
          }

          const cartData = getcart.map((cart) => ({
            id: cart.dataValues.id,
            userproduct: cart.dataValues.product,
            quantity: cart.dataValues.quantity,
          }));

          return {
            data: cartData,
          };
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    addtocart: async (
      parents: ParentNode,
      args: { input: addCartInterface },
      context: ContextInterface
    ) => {
      const { quantity, product_id } = args.input;

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
        const product = await Product.findByPk(product_id, {
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        });

        if (!product) {
          throw new Error(`Product with ID ${product_id} not found`);
        }
        // Check if the product is already in the cart

        const existingCartEntry = await Cart.findOne({
          where: {
            product_id,
            userId: tokenData?.data?.id,
          },
        });

        if (existingCartEntry) {
          const newQuantity = existingCartEntry.dataValues.quantity + quantity;

          const cartUpdate = await Cart.update(
            { quantity: newQuantity },
            {
              where: { product_id, userId: tokenData?.data?.id },
            }
          );
          if (!cartUpdate) {
            throw new GraphQLError("Cart Update Failed", {
              extensions: {
                code: "CART_UPDATE_FAILED",
                http: { status: 401 },
                message: "Cart update has been failed",
              },
            });
          }

          return {
            data: product,
            quantity: newQuantity,
            message: "Quantity updated in Cart",
          };
        } else {
          const newCartEntry = await Cart.create({
            productId: product_id,
            userId: tokenData?.data?.id,
            quantity,
          });

          return {
            data: product,
            quantity,
            message: "Product added to Cart",
          };
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    removefromcart: async (
      parents: ParentNode,
      args: { input: removeCartInterface },
      context: ContextInterface
    ) => {
      const { cart_id } = args.input;

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
        const cartItem = await Cart.findByPk(cart_id, {
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: User,
                  as: "user",
                },
              ],
            },
          ],
        });

        if (!cartItem) {
          throw new GraphQLError("Cart Item is not found", {
            extensions: {
              code: "CART_NOT_FOUND",
              http: { status: 401 },
              message: "The Cart Item is not found ",
            },
          });
        }

        const productData = await Product.findByPk(
          cartItem?.dataValues.productId
        );
        if (!productData) {
          throw new GraphQLError("Product not found", {
            extensions: {
              code: "PRODUCT_NOT_FOUND",
              http: { status: 401 },
              message: "The product is not found",
            },
          });
        }

        if (tokenData?.data?.id !== cartItem!.dataValues.userId) {
          throw new GraphQLError("The user is not authorized", {
            extensions: {
              code: "UNAUTHORIZED_USER",
              http: { status: 401 },
              message: "the user is not authorized to delete the cart",
            },
          });
        }

        if (!cartItem) {
          throw new Error(`Cart with ID ${cart_id} not found`);
        }

        await cartItem.destroy();
        return {
          data: {
            id: cartItem?.dataValues.id,
            quantity: cartItem?.dataValues.quantity,
            userproduct: cartItem?.dataValues.product,
          },

          message: "Product removed from  Cart",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    removeallfromcart: async (
      parents: ParentNode,
      args: any,
      context: ContextInterface
    ) => {
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
        const cartItems = await Cart.findAll({
          where: { userId: tokenData?.data?.id },
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: User,
                  as: "user",
                },
              ],
            },
          ],
        });

        if (cartItems.length <= 0) {
          throw new GraphQLError("No items in Cart", {
            extensions: {
              code: "CART_NOT_FOUND",
              http: { status: 401 },
              message: "No items in cart",
            },
          });
        }
        for (let cartItem of cartItems) {
          if (tokenData?.data?.id !== cartItem!.dataValues.user_id) {
            throw new GraphQLError("The user is not authorized", {
              extensions: {
                code: "UNAUTHORIZED_USER",
                http: { status: 401 },
                message: "the user is not authorized to delete the cart",
              },
            });
          }
          await cartItem.destroy();
        }
        const cartData = cartItems.map((cart) => ({
          id: cart.dataValues.id,
          userproduct: cart.dataValues.product,
          quantity: cart.dataValues.quantity,
        }));

        return {
          data: cartData,
          message: "Removed All Item from Cart",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
