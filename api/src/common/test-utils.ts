import { createTestClient } from 'apollo-server-testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApolloServer, DataSources } from '../apollo';
import { createMongoClient } from '../mongo';

export const createMongoClientWithInMemoryDb = async () => {
  const mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getUri();
  const client = await createMongoClient(uri);

  return {
    instance: () => client,
    start: () => mongoServer.start(),
    stop: () => mongoServer.stop(),
  };
};

export const createApolloTestClient = (dataSources: DataSources) => {
  const server = createApolloServer(dataSources);
  return createTestClient(server as any);
};
