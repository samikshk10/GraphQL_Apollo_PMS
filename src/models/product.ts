import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { ProductInterface } from "../interfaces/ProductInterface";

const Product = sequelize.define<ProductInterface>(
  "Product",
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
  },
  {
    tableName: "Products",
    timestamps: true,
    underscored: true,
    paranoid: true,
  }
);

export default Product;
