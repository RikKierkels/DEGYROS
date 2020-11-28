import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';
import { handleAddTransactions } from './add-transactions';
import { handleGetTransactions } from './get-transactions';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: async (_, { page }, { dataSources: { transactionsDb } }) =>
      handleGetTransactions(transactionsDb, page || { size: 0, offset: 0 }),
  },
  Mutation: {
    addTransactions: async (_, { file: { file } }, { dataSources: { transactionsDb } }) =>
      handleAddTransactions(transactionsDb, file),
  },
  Transaction: {
    id: ({ _id }) => _id,
  },
};

export default resolvers;
