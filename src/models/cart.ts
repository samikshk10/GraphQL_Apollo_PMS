import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { Product, User } from "./index";

export const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        table: "Users",
        key: "id",
      },
      allowNull: false,
      field: "user_id",
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
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "Carts",
    timestamps: true,
    underscored: true,
  }
);

Cart.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Cart.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
User.hasMany(Product, {
  foreignKey: "user_id",
  as: "products",
});
User.hasMany(Cart, {
  foreignKey: "user_id",
  as: "carts",
});
Product.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Product.belongsTo(Cart, {
  foreignKey: "id",
  as: "cart",
});
