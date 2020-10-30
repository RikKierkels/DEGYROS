import { ApolloServer } from 'apollo-server';
import { DateTimeResolver } from 'graphql-scalars';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { Resolvers } from './generated/graphql';
import typeDefs from './schema';

const resolvers: Resolvers = {
  Query: {},
  Transaction: {},
  DateTime: DateTimeResolver,
};

const server = new ApolloServer({ typeDefs: [DIRECTIVES, typeDefs], resolvers: {} });
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
