import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { ProductInterface } from "../interfaces/ProductInterface";

const Product = sequelize.define<ProductInterface>(
  "Products",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("Grocery", "Electronics", "Clothings", "Others"),
      defaultValue: "Others",
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        table: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    tableName: "Products",
    timestamps: true,
    underscored: true,
    paranoid: true,
  }
);

export default Product;
