import jwt, { JwtPayload } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import {
  AddProductInterface,
  ProductInterface,
} from "../interfaces/ProductInterface";
import { Product } from "../models";

export const GetAllProduct = async () => {
  try {
    const getProduct = await Product.findAll();
    if (!getProduct) {
      throw new GraphQLError(`Product not found`, {
        extensions: {
          code: "NO_PRODUCT_FOUND",
          http: {
            status: 400,
          },
        },
      });
    }

    return getProduct;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const AddProduct = async (
  parents: any,
  args: { input: AddProductInterface },
  context: any
): Promise<ProductInterface> => {
  const { name, price } = args.input;

  if (!context.token) {
    throw new Error("Authorization Token missing");
  }

  const tokenData = (await authenticate(context?.token)) as JwtPayload;

  try {
    const newUser: any = await Product.create({
      name,
      price,
      user_id: tokenData?.user?.id,
    });
    return {
      ...newUser.dataValues,
      message: "Product added successfully",
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const authenticate = async (bearerToken: string) => {
  try {
    const token = bearerToken.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        if (user) {
          return {
            user,
            token,
          };
        }
        throw new GraphQLError("User not found", {
          extensions: {
            code: "UNAUTHORIZED",
            http: { status: 402 },
          },
        });
      } catch (error) {
        throw new Error("Invalid or Expired token");
      }
    } else {
      throw new Error("Authorization token must be 'Bearer [token]'");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
