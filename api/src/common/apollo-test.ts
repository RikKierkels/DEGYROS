import { createApolloServer } from '../apollo';
import { createTestClient } from 'apollo-server-testing';

export const createApolloTestClient = () => {
  const server = createApolloServer();
  return createTestClient(server as any);
};
