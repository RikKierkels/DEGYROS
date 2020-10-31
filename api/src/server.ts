import { join } from 'path';
import { ApolloServer } from 'apollo-server';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { loadFilesSync } from '@graphql-tools/load-files';
import typeDefs from './schema';

const resolvers = loadFilesSync(join(__dirname, './**/resolvers.*'));
const server = new ApolloServer({ typeDefs: [DIRECTIVES, typeDefs], resolvers });
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
