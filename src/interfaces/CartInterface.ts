import { Model } from "sequelize";

export interface addCartInterface extends Model {
  product_id: number;
  quantity: number;
}

export interface removeCartInterface extends Model {
  cart_id: number;
}
