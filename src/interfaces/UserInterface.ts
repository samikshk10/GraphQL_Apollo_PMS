import { Model } from "@sequelize/core";
import { JwtPayload } from "jsonwebtoken";

export interface UserInterface extends Model {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponseInterface {
  data?: string | JwtPayload;
  token: string;
}

export interface SignUpInputInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInputInterface {
  email: string;
  password: string;
  confirmPassword: string;
}
