import { Product, User, Cart, Order } from "../../models";
import { ContextInterface } from "../../interfaces";
import { authenticate } from "../../Middleware";
import { JwtPayload } from "jsonwebtoken";
import { GraphQLError } from "graphql";

export const orderResolvers = {
  Query: {
    getorder: async (parent: any, args: any, context: ContextInterface) => {
      try {
        if (!context?.token) {
          throw new Error("Authorization Token Missing");
        }

        const tokenData = (await authenticate(context?.token)) as JwtPayload;
        if (tokenData?.user) {
          const getOrder = await Order.findAll({
            where: { user_id: tokenData?.user?.id },
            include: [
              {
                model: Product,
                as: "product",
              },
              {
                model: User,
                as: "user",
              },
            ],
          });

          if (getOrder.length <= 0) {
            throw new GraphQLError("There are no orders for the current User", {
              extensions: {
                code: "NO_ORDER_FOUND",
                http: { status: 404 },
                message: `No orders for the current User`,
              },
            });
          }

          // Ensure you map the results to include the product details
          const orderResponse = getOrder.map((order) => ({
            data: {
              product: order?.dataValues.product, // Include the product details here
              user: order?.dataValues.user, // Include the user details here
            },
          
          }));

          console.log(orderResponse);

          return {
            data: orderResponse,
          };
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    checkout: async (parents: any, args: any, context: ContextInterface) => {
      console.log("hello world");
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
            },
            {
              model: User,
              as: "user",
            },
          ],
        });

        if (!cartItems.length) {
          throw new Error(`Please add some items to Cart to place order`);
        }

        const orders = [];

        for (const cartItem of cartItems) {
          let totalPrice =
            +cartItem?.dataValues.product.price * cartItem?.dataValues.quantity;
          const order = await Order.create({
            userId: cartItem?.dataValues.user_id,
            productId: cartItem?.dataValues.product_id,
            quantity: cartItem?.dataValues.quantity,
            totalPrice,
          });

          orders.push(...cartItems);
        }

        await Cart.destroy({
          where: { user_id: tokenData?.user?.id },
        });

        console.log(orders);

        return {
          data: orders,
          message: "Order placed successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
