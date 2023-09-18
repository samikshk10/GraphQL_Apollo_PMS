export const productTypeDefs = `#graphql

  type Product {
    id: Int
    name: String
    price: Int
    category: String
    user_id: Int
    user: User
  }

  type ProductsResponse{
    data: [Product]
  }


  type ProductResponse {
    data: Product
    quantity: Int
    message: String
  }

  input AddProductInput {
    name: String!
    price: Int!
    category: String!
  }

  input DeleteProductInput {
    id: Int!
  }

  input UpdateProductInput {
    id: Int!
    name: String
    price: Int
    category: String
  }


  type Query {
    getallproduct: ProductsResponse
    getproduct: ProductsResponse

  }

   type Mutation {
    addproduct(input: AddProductInput): ProductResponse
    deleteproduct(input: DeleteProductInput): ProductResponse
    updateproduct(input: UpdateProductInput): ProductResponse
  }
`;
