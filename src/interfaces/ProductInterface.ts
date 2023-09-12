import { Model } from "@sequelize/core";

export interface ProductInterface extends Model {
  id?: number;
  name?: string;
  price?: number;
  user_id?: number;
  created_at?: Date;
  updated_at?: Date;
  token?: string;
}

export interface AddProductInterface {
  name: string;
  price: number;
}
