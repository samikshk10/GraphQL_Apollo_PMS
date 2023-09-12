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
    token: String
}

type Product{
    id:ID
    name: String
    price: Int
    user_id: Int
    createdAt: Date
    updatedAt: Date
}

type Query{
    users: [User]
    getallproduct: [Product]
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


input AddProductInput{
  name: String!
  price: Int!
}


type Mutation{
    signup(input: SignUpUserInput):User
    login(input: LoginUserInput):User

    addproduct(input: AddProductInput):Product
    
}
`;
