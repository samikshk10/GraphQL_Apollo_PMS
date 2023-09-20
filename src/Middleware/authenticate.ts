import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { UserResponseInterface } from "../interfaces";
export const authenticate = async (
  bearerToken: string
): Promise<UserResponseInterface> => {
  try {
    const token = bearerToken.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        if (user) {
          return {
            data: user,
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
      throw new GraphQLError("Authorization Must be Bearer [Token]", {
        extensions: {
          code: "AUTHORIZATION_FAILED",
          http: { status: 401 },
          message: `Authorization Must be Bearer `,
        },
      });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
