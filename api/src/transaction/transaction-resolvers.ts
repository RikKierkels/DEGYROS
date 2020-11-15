import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';
import { handleAddTransactions } from './add-transactions';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: (parent, args, { dataSources: { transactionsDb } }) => {
      return transactionsDb.collection.find().toArray();
    },
  },
  Mutation: {
    addTransactions: async (parent, { file: { file } }, { dataSources: { transactionsDb } }) =>
      handleAddTransactions(file, transactionsDb),
  },
  Transaction: {
    id: ({ _id }) => _id,
  },
};

export default resolvers;
