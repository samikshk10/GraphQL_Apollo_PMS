import { GraphQLError } from "graphql";
import { Product, Cart, OrderItems, Order } from "../../models";
import { ContextInterface } from "../../interfaces";
import { authenticate } from "../../Middleware";
import { JwtPayload } from "jsonwebtoken";
import { Op } from "sequelize";

export const orderResolvers = {
  Query: {
    getorder: async (
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
          const getOrderData = await Order.findAll({
            where: {
              userId: tokenData?.data?.id,
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

    gettodayorder: async (
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
          const today = new Date().setHours(0, 0, 0, 0);

          const getOrderData = await Order.findAll({
            where: {
              userId: tokenData?.data?.id,
              createdAt: {
                [Op.gte]: today,
              },
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

    getallorder: async (
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
          const getAllOrderData = await Order.findAll({
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

          if (getAllOrderData.length <= 0) {
            throw new GraphQLError("There are no orders", {
              extensions: {
                code: "NO_ORDER_FOUND",
                http: { status: 404 },
                message: `No orders`,
              },
            });
          }

          return {
            data: getAllOrderData,
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
            },
          ],
        });

        if (!cartItems.length) {
          throw new GraphQLError(
            "Please add some items to Cart to place order",
            {
              extensions: {
                code: "EMPTY_CART",
                http: { status: 401 },
                message: `Cart is Empty`,
              },
            }
          );
        }
        let totalPrice = cartItems.reduce((acc, item: any) => {
          return acc + parseFloat(item.product.price);
        }, 0);

        //create order -> total price , userid , status
        // create order items -> [orderId, productId, qty, amount]

        const order = await Order.create({
          userId: tokenData?.data?.id,
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

        await Cart.destroy({
          where: { userId: tokenData?.data?.id },
        });

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
