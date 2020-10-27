import { ApolloServer, gql } from 'apollo-server';
import { Resolvers } from './generated/graphql';

const typeDefs = gql`
  type Query {
    order: Order
  }

  type Order {
    id: ID!
  }

  type Transaction {
    id: ID!
  }
`;

const resolvers: Resolvers = {
  Query: {},
  Order: {},
  Transaction: {},
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
