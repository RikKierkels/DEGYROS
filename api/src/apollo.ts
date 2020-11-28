import { ApolloServer, makeExecutableSchema } from 'apollo-server';
import { MongoClient } from 'mongodb';
import { join } from 'path';
import { DIRECTIVES as typeDefsMongo } from '@graphql-codegen/typescript-mongodb';
import { loadFilesSync } from '@graphql-tools/load-files';
import typeDefs from './schema';
import { MongoDataSource } from './common/mongo-datasource';
import { TransactionDbObject } from './generated/graphql';

export type TransactionsDb = MongoDataSource<TransactionDbObject>;
export type DataSources = {
  transactionsDb: TransactionsDb;
};

export type Context = {
  dataSources: DataSources;
};

export const createDataSources = (mongoClient: MongoClient): DataSources => {
  const collection = (name: string) => mongoClient.db().collection(name);

  return {
    transactionsDb: new MongoDataSource<TransactionDbObject>(collection('transactions')),
  };
};

export const createApolloServer = (dataSources: DataSources): ApolloServer => {
  const resolvers = loadFilesSync(join(__dirname, './**/*-resolvers.*'));
  const schema = makeExecutableSchema({
    resolvers,
    typeDefs: [typeDefs, typeDefsMongo],
    inheritResolversFromInterfaces: true,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });
  return new ApolloServer({ schema, dataSources: () => dataSources });
};
