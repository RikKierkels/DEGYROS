import { ApolloServer, makeExecutableSchema } from 'apollo-server';
import { DIRECTIVES as typeDefsMongoDb } from '@graphql-codegen/typescript-mongodb';
import typeDefs from './schema';
import { loadFilesSync } from '@graphql-tools/load-files';
import { join } from 'path';

export const createApolloServer = (): ApolloServer => {
  const resolvers = loadFilesSync(join(__dirname, './**/*.resolvers.*'));
  const schema = makeExecutableSchema({
    resolvers,
    typeDefs: [typeDefs, typeDefsMongoDb],
    inheritResolversFromInterfaces: true,
  });
  return new ApolloServer({ schema });
};
