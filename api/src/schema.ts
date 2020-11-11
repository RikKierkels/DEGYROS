import { gql } from 'apollo-server';

export default gql`
  scalar DateTime
  scalar Upload

  type Query {
    transactions: [Transaction!]
  }

  type Mutation {
    addTransactions(file: Upload!): [Transaction!]
  }

  type Transaction @entity {
    id: ID! @id
    purchaseDate: DateTime! @column(overrideType: "string")
    product: String! @column
    ISIN: String! @column
    exchange: String! @column
    count: Int! @column
    rate: Price! @embedded
    purchaseValue: Price! @embedded
    costs: Price! @embedded
    total: Price! @embedded
  }

  type Price @entity(embedded: true) {
    amount: Int! @column
    numberOfDecimals: Int! @column
    currency: String! @column
  }
`;
