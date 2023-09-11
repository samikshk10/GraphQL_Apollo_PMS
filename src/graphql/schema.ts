export const typeDefs = `#graphql

type User {
    id: ID
    username: String
}

type Query{
    users: [User]
}
`;
