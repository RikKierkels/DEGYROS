import { gql } from 'apollo-server';

export default gql`
  scalar DateTime

  type Query {
    transactions: [Transaction!]
  }

  type Transaction @entity {
    id: ID! @id
    purchaseDate: DateTime!
    product: String!
    ISIN: String!
    exchange: String!
    count: Int!
    rate: Price!
    purchaseValue: Price!
    costs: Price!
    total: Price!
  }

  type Price {
    amount: Int!
    currency: String!
  }
`;
