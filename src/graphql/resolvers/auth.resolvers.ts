import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import { User } from "../../models";
import { LoginInputInterface, SignUpInputInterface } from "../../interfaces";
import jwt from "jsonwebtoken";

export const authResolvers = {
  Query: {
    users: async () => {
      try {
        const users = await User.findAll();
        if (users.length <= 0) {
          throw new GraphQLError("No User Found", {
            extensions: {
              code: "NO_USER",
              http: {
                status: 400,
              },
              message: "No User Found",
            },
          });
        }
        return users;
      } catch (error: any) {
        throw new GraphQLError(error.message || "Internal Server Error", {
          extensions: {
            code: "FAILED ",
            http: {
              status: 400,
            },
          },
        });
      }
    },
  },
  Mutation: {
    //User Mutation

    signup: async (
      parents: ParentNode,
      args: { input: SignUpInputInterface }
    ) => {
      const { firstName, lastName, email, password, confirmPassword } =
        args.input;

      if (password.length < 8 || confirmPassword.length < 8) {
        throw new GraphQLError(
          "The password must be of at least 8 characters",
          {
            extensions: {
              code: "INVALID_PASSWORD_FORMAT",
              http: {
                status: 401,
              },
              messsage: `Password must be at least 8 characters`,
            },
          }
        );
      }

      if (password !== confirmPassword) {
        throw new GraphQLError(`Password doesn't match with confirm password`, {
          extensions: {
            code: "INVALID_CPASSWORD",
            http: {
              status: 409,
            },
            message: `Confirm password doesn't match`,
          },
        });
      }
      try {
        const userFind = await User.findOne({ where: { email: email } });

        if (userFind !== null) {
          throw new GraphQLError(`User ${email} already exists`, {
            extensions: {
              code: "EMAIL_EXISTS",
              http: {
                status: 409,
              },
              message: `User ${email} already exists`,
            },
          });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });
        return {
          data: newUser,
          message: "Sign up Successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    login: async (parent: ParentNode, args: { input: LoginInputInterface }) => {
      const { email, password } = args.input;
      if (password!.length < 8) {
        throw new GraphQLError(
          "The password must be of at least 8 characters",
          {
            extensions: {
              code: "INVALID_PASSWORD_FORMAT",
              http: {
                status: 401,
              },
              messsage: `Password must be at least 8 characters`,
            },
          }
        );
      }
      try {
        const userFind = await User.findOne({ where: { email: email } });

        if (!userFind) {
          throw new GraphQLError(`User ${email} not found`, {
            extensions: {
              code: "EMAIL_NOT_FOUND",
              http: { status: 404 },
              message: `User ${email} not found`,
            },
          });
        }

        const isValidPassword = await bcrypt.compare(
          password!.toString(),
          userFind.dataValues.password
        );

        if (!isValidPassword) {
          throw new GraphQLError("Incorrect Email or Password", {
            extensions: {
              code: "INCORRECT_EMAIL_PASSWORD",
              http: { status: 401 },
              message: `Incorrect Email or Password`,
            },
          });
        }

        const payload = {
          firstName: userFind.dataValues.firstName,
          lastName: userFind.dataValues.lastName,
          id: userFind.dataValues.id,
          email: userFind.dataValues.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
          expiresIn: "1d",
        });

        return {
          data: userFind,
          token,
          message: "Login Successfully",
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};
