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
    getcart: async (parent: any, args: any, context: ContextInterface) => {
      console.log("hello world");
      try {
        if (!context?.token) {
          throw new Error("Authorization Token Missing");
        }

        const tokenData = (await authenticate(context?.token)) as JwtPayload;
        if (tokenData?.user) {
          const getcart = await Cart.findAll({
            where: { user_id: tokenData?.user?.id },
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

          console.log("this is getCart >>>>", getcart);
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
      parents: any,
      args: { input: addCartInterface },
      context: ContextInterface
    ) => {
      const { quantity, product_id } = args.input;

      if (!context?.token) {
        throw new Error("Authorization Token missing");
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

        console.log("this is product>>>>", product);

        if (!product) {
          throw new Error(`Product with ID ${product_id} not found`);
        }
        // Check if the product is already in the cart
        const existingCartEntry = await Cart.findOne({
          where: {
            product_id,
            user_id: tokenData?.user?.id,
          },
        });

        if (existingCartEntry) {
          const newQuantity = existingCartEntry.dataValues.quantity + quantity;

          console.log("this is new quanityt" + newQuantity);
          const cartUpdate = await Cart.update(
            { quantity: newQuantity },
            {
              where: { product_id, user_id: tokenData?.user?.id },
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
          console.log("Updated cart entry:", existingCartEntry);

          return {
            data: product,
            quantity: newQuantity,
            message: "Quantity updated in Cart",
          };
        } else {
          const newCartEntry = await Cart.create({
            productId: product_id,
            userId: tokenData?.user?.id,
            quantity,
          });
          console.log("New cart entry:", newCartEntry);

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
      parents: any,
      args: { input: removeCartInterface },
      context: ContextInterface
    ) => {
      const { cart_id } = args.input;

      if (!context?.token) {
        throw new Error("Authorization Token missing");
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

        const productData = await Product.findByPk(
          cartItem?.dataValues.product_id
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

        if (!cartItem) {
          throw new GraphQLError("Cart Item is not found", {
            extensions: {
              code: "CART_NOT_FOUND",
              http: { status: 401 },
              message: "The Cart Item is not found ",
            },
          });
        }

        if (tokenData?.user?.id !== cartItem!.dataValues.user_id) {
          throw new GraphQLError("The user is not authorized", {
            extensions: {
              code: "UNAUTHORIZED_USER",
              http: { status: 401 },
              message: "the user is not authorized to delete the cart",
            },
          });
        }

        console.log("this is cartItem", cartItem);

        if (!cartItem) {
          throw new Error(`Cart with ID ${cart_id} not found`);
        }

        await cartItem.destroy();
        console.log(cartItem);
        return {
          data: cartItem,
          message: "Product removed from  Cart",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },

    removeallfromcart: async (
      parents: any,
      args: any,
      context: ContextInterface
    ) => {
      if (!context?.token) {
        throw new Error("Authorization Token missing");
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const cartItems = await Cart.findAll({
          where: { user_id: tokenData?.user?.id },
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
          if (tokenData?.user?.id !== cartItem!.dataValues.user_id) {
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

        console.log(cartItems);
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
