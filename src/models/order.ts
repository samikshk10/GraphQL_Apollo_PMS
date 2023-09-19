import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { OrderItems } from "./index";
import { OrderStatus } from "../Enum";

const Order = sequelize.define(
  "Order",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    userId: {
      type: DataTypes.INTEGER,
      references: {
        table: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false,
      field: "user_id",
    },

    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: "pending",
      allowNull: false,
    },

    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

Order.hasMany(OrderItems, {
  foreignKey: "order_id",
  as: "orderItems",
});
// Order.belongsTo(User, {
//   foreignKey: "user_id",
//   as: "user",
// });
OrderItems.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

export default Order;
