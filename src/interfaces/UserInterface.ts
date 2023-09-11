import { Model } from "@sequelize/core";

export interface UserInterface extends Model {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
