import { GraphQLError } from "graphql";
import { Product, Cart, OrderItems, Order } from "../../models";
import { ContextInterface } from "../../interfaces";
import { authenticate } from "../../Middleware";
import { JwtPayload } from "jsonwebtoken";

export const orderResolvers = {
  Query: {
    getorder: async (
      parent: ParentNode,
      args: any,
      context: ContextInterface
    ) => {
      try {
        if (!context?.token) {
          throw new Error("Authorization Token Missing");
        }

        const tokenData = (await authenticate(context?.token)) as JwtPayload;
        if (tokenData?.user) {
          const getOrderData = await Order.findAll({
            where: {
              userId: tokenData?.user?.id,
            },
            include: [
              {
                model: OrderItems,
                as: "orderItems",
                include: [
                  {
                    model: Product,
                    as: "product",
                  },
                ],
              },
            ],
          });

          if (getOrderData.length <= 0) {
            throw new GraphQLError("There are no orders for the current User", {
              extensions: {
                code: "NO_ORDER_FOUND",
                http: { status: 404 },
                message: `No orders for the current User`,
              },
            });
          }

          return {
            data: getOrderData,
          };
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    checkout: async (
      parents: ParentNode,
      args: any,
      context: ContextInterface
    ) => {
      if (!context?.token) {
        throw new Error("Authorization Token missing");
      }

      const tokenData = (await authenticate(context?.token)) as JwtPayload;

      try {
        const cartItems = await Cart.findAll({
          where: { userId: tokenData?.user?.id },
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        });

        if (!cartItems.length) {
          throw new Error(`Please add some items to Cart to place order`);
        }
        let totalPrice = cartItems.reduce((acc, item: any) => {
          return acc + parseFloat(item.product.price);
        }, 0);

        //create order -> total price , userid , status
        // create order items -> [orderId, productId, qty, amount]

        const order = await Order.create({
          userId: tokenData?.user?.id,
          status: "pending",
          totalPrice,
        });

        const payload = cartItems.map((item: any) => {
          return {
            orderId: order.dataValues.id,
            productId: item.productId,
            quantity: item.quantity,
            amount: item.product.price,
          };
        });

        const createOrderItem = await OrderItems.bulkCreate(payload);

        // await Cart.destroy({
        //   where: { userId: tokenData?.user?.id },
        // });

        console.log("cretae order item", createOrderItem);

        return {
          data: createOrderItem,
          message: "Order placed successfully",
        };
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    },
  },
};
