export const typeDefs = `#graphql
scalar Date
type User {
    id: ID
    firstName:String
    lastName: String
    email:String
    createdAt: Date
    updatedAt: Date
    message: String
}

type Query{
    users: [User]
}

input SignUpUserInput{
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    confirmPassword: String!

}

input LoginUserInput{
    email: String!
    password: String!
}


type Mutation{
    signup(input: SignUpUserInput):User
    login(input: LoginUserInput):User
}
`;
