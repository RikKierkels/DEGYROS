import { join } from 'path';
import { MongoClient } from 'mongodb';
import { ApolloServer, makeExecutableSchema } from 'apollo-server';
import { DIRECTIVES as typeDefsMongo } from '@graphql-codegen/typescript-mongodb';
import { loadFilesSync } from '@graphql-tools/load-files';
import typeDefs from './schema';
import { TransactionDbObject } from './generated/graphql';
import { MongoDataSource } from './common/mongo-datasource';

export type DataSources = {
  transactionsDb: MongoDataSource<TransactionDbObject>;
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
  });
  return new ApolloServer({ schema, dataSources: () => dataSources });
};
