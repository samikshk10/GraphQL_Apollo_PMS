import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { Order, User, Product } from "./index";

export const OrderItems = sequelize.define(
  "OrderItems",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    orderId: {
      type: DataTypes.INTEGER,
      references: {
        table: "Orders",
        key: "id",
      },
      allowNull: false,
      field: "order_id",
    },

    productId: {
      type: DataTypes.INTEGER,
      references: {
        table: "Products",
        key: "id",
      },
      allowNull: false,
      field: "product_id",
    },

    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "OrderItems",
    timestamps: true,
    underscored: true,
  }
);

OrderItems.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// OrderItems.belongsTo(Product, {
//   foreignKey: "product_id",
//   as: "product",
// });

export default OrderItems;
