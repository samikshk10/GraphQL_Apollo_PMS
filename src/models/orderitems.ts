import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { User } from "./index";
import { Product } from "./index";

const OrderItems = sequelize.define(
  "OrderItems",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    order_id: {
      type: DataTypes.INTEGER,
      references: {
        table: "Orders",
        key: "id",
      },
      allowNull: false,
    },

    product_id: {
      type: DataTypes.INTEGER,
      references: {
        table: "Products",
        key: "id",
      },
      allowNull: false,
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
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    underscored: true,
  }
);

OrderItems.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

OrderItems.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

export default OrderItems;
