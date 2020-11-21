import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';
import { handleAddTransactions } from './add-transactions';
import { handleGetTransactions } from './get-transactions';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: async (_, __, { dataSources: { transactionsDb } }) => handleGetTransactions(transactionsDb),
  },
  Mutation: {
    addTransactions: async (_, { file: { file } }, { dataSources: { transactionsDb } }) =>
      handleAddTransactions(file, transactionsDb),
  },
  Transaction: {
    id: ({ _id }) => _id,
  },
};

export default resolvers;
