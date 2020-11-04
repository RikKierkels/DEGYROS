import { createTestClient } from 'apollo-server-testing';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApolloServer, DataSources } from '../apollo';

export const createInMemoryMongoClient = async (): Promise<MongoClient> => {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getUri();
  return new MongoClient(uri, { useUnifiedTopology: true }).connect();
};

export const createApolloTestClient = (mongoClient: MongoClient, dataSources: DataSources) => {
  const server = createApolloServer(mongoClient, dataSources);
  return createTestClient(server as any);
};
