export const cartTypeDefs = `#graphql

  type Cart{
    id: Int
    userproduct: Product
    quantity:Int
  }

  type MultiCartResponse{
    data: [Cart]
    message: String
  }

  type SingleCartResponse{
    data: Cart
    quantity: Int
    message: String
  }

  type CartResponse{
    data: Product
    quantity: Int
    message: String
  }

  input addCartInput{
    product_id: Int!
    quantity: Int!
  }


  input removeCartInput{
    cart_id: Int!
  }
  

  type Query {
    getproduct: ProductsResponse
    getcart: MultiCartResponse
  }

   type Mutation {
    addtocart(input: addCartInput): CartResponse
    removefromcart(input: removeCartInput):SingleCartResponse
    removeallfromcart:MultiCartResponse
  }
`;
