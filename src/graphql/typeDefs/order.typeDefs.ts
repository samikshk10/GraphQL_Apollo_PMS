export const orderTypeDefs = `#graphql

type Order {
    product: Product
    user: User
}

  type OrderResponse{
    data: [Order]
    quantity: String
    totalprice: Int
    message: String
  }


  type Query {
    getorder:OrderResponse
  }

   type Mutation {
    checkout: OrderResponse
  }
`;
