import bcrypt from "bcrypt";
import { GraphQLError } from "graphql";
import {
  LoginInputInterface,
  SignUpInputInterface,
  UserInterface,
} from "../interfaces";
import { User } from "../models";

export const getUsers = async () => {
  try {
    const users = await User.findAll();
    if (users.length <= 0) {
      throw new GraphQLError("No User Found", {
        extensions: {
          code: "NO_USER",
          http: {
            status: 400,
          },
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
};

export const SignUp = async (
  parents: any,
  args: { input: SignUpInputInterface }
): Promise<UserInterface> => {
  const { firstName, lastName, email, password, confirmPassword } = args.input;

  if (password.length < 8 || confirmPassword.length < 8) {
    throw new GraphQLError("The password must be of at least 8 characters", {
      extensions: {
        code: "INVALID_PASSWORD_FORMAT",
        http: {
          status: 401,
        },
      },
    });
  }

  if (password !== confirmPassword) {
    throw new GraphQLError(`Password doesn't match with confirm password`, {
      extensions: {
        code: "INVALID_CPASSWORD",
        http: {
          status: 409,
        },
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
        },
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser: any = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    console.log(newUser.dataValues);
    return {
      ...newUser.dataValues,
      message: "Sign up Successfully",
    };
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

// Login

export const Login = async (
  parent: any,
  args: { input: LoginInputInterface }
): Promise<UserInterface> => {
  const { email, password } = args.input;
  if (password!.length < 8) {
    // throw new Error("The password must be of at least 8 characters");
    throw new GraphQLError("The password must be of at least 8 characters", {
      extensions: {
        code: "INVALID_PASSWORD_FORMAT",
      },
    });
  }
  try {
    const userFind = await User.findOne({ where: { email: email } });

    if (!userFind) {
      throw new GraphQLError(`User ${email} not found`, {
        extensions: {
          code: "EMAIL_NOT_FOUND",
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
        },
      });
    }
    return {
      ...userFind.dataValues,
      message: "Login Successfully",
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
