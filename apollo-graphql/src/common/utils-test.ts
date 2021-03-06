import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApolloServer, DataSources } from '../apollo';
import { createMongoClient } from '../mongo';

export type MongoMemoryClient = {
  instance: () => MongoClient;
  stop: () => Promise<boolean>;
};

export const createMongoMemoryClient = async (): Promise<MongoMemoryClient> => {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getUri();
  const client = await createMongoClient(uri);

  return {
    instance: () => client,
    stop: () => (client.close(), mongoServer.stop()),
  };
};

export const createApolloTestClient = (dataSources: DataSources): ApolloServerTestClient => {
  const server = createApolloServer(dataSources);
  return createTestClient(server as any);
};
