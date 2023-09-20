import { Model } from "@sequelize/core";
import { ProductCategoryEnum } from "../Enum";

export interface ProductInterface extends Model {
  id?: number;
  name?: string;
  price?: number;
  user_id?: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddProductInterface {
  name: string;
  price: number;
  category: ProductCategoryEnum;
}

export interface DeleteProductInterface {
  id: number;
}

export interface UpdateProductInterface {
  id: number;
  name?: string;
  price?: number;
  category?: string;
}
