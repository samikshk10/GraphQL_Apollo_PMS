export const orderTypeDefs = `#graphql

type Order {
    id: Int
    userId:Int
    status: String
    totalPrice: Int
}

type OrderItems{
  id: Int
  orderId: Int
  productId:Int
  quantity: Int
  amount: Int
}

type OrderItemswithProduct{
  id: Int
  orderId: Int
  productId:Int
  quantity: Int
  amount: Int
  product: Product

}

type OrderWithOrderItems{
    id: Int
    userId:Int
    status: String
    totalPrice: Int
    orderItems: [OrderItemswithProduct]
}


type MultiOrderResponse{
  data: [OrderWithOrderItems]
  message: String
}

type SingleOrderResponse{
  data: [OrderItems]
  message: String
}


  type Query {
    getorder:MultiOrderResponse
    gettodayorder:MultiOrderResponse

    getallorder: MultiOrderResponse
  }

   type Mutation {
    checkout: SingleOrderResponse
  }
`;
