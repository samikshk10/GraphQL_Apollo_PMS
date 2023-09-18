export const userTypeDefs = `#graphql

  type User {
    id: Int
    firstName: String
    lastName: String
    email: String
  }

  type UserResponse {
    data: User
    message: String
    token: String
  }

  input SignUpUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginUserInput {
    email: String!
    password: String!
  }

  type Query {
    users: [User]
  }

   type Mutation {
    signup(input: SignUpUserInput): UserResponse
    login(input: LoginUserInput): UserResponse
  }
`;
