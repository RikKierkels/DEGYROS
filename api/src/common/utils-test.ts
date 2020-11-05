import { createTestClient } from 'apollo-server-testing';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApolloServer, DataSources } from '../apollo';
import { createMongoClient } from '../mongo';

export const createMongoClientWithInMemoryDb = async (): Promise<MongoClient> => {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getUri();
  return createMongoClient(uri);
};

export const createApolloTestClient = (mongoClient: MongoClient, dataSources: DataSources) => {
  const server = createApolloServer(mongoClient, dataSources);
  return createTestClient(server as any);
};
