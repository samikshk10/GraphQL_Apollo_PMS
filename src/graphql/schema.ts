import { UserInterface } from "./../interfaces/UserInterface";
export const typeDefs = `#graphql
scalar Date
type User {
    id: ID
    firstName:String
    lastName: String
    email:String
    createdAt: Date
    updatedAt: Date
}

type Product{
    id:ID
    name: String
    price: Int
    category: String
    user_id: Int
    createdAt: Date
    updatedAt: Date
    user: User
}
type UserResponse{
    data: User
    message: String
    token: String
}



type ProductResponse {
    data:[Product]
    message: String
}

type Query{
    users: [User]
    getallproduct: [Product]
    getproduct:[Product]
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
  category: String!
}



input DeleteProductInput{
    id: ID!
}

input UpdateProductInput{
    id: ID!
    name: String
    price: Int
    category: String
}


type Mutation{
    signup(input: SignUpUserInput):UserResponse
    login(input: LoginUserInput):UserResponse

    addproduct(input: AddProductInput):ProductResponse
    deleteproduct(input: DeleteProductInput): ProductResponse
    updateproduct(input: UpdateProductInput): ProductResponse
}
`;
