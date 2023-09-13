import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config";
import { ProductInterface } from "../interfaces/ProductInterface";
import { User } from "./index";

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
User.hasMany(Product, {
  foreignKey: "user_id", 
  as: "user", 
});

Product.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Product;
