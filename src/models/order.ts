import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { User } from "./index";
import { Product } from "./index";

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
    },

    status: {
      type: DataTypes.ENUM("pending", "tracking", "delivered"),
      defaultValue: "pending",
      allowNull: false,
    },

    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },

    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

User.hasMany(Order, {
  foreignKey: "order_id",
  as: "order",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Order;
