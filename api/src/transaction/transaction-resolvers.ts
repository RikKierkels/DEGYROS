import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';
import { handleAddTransactions } from './add-transactions';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: (parent, args, { dataSources: { transaction } }) => {
      return transaction.collection.find().toArray();
    },
  },
  Mutation: {
    addTransactions: async (parent, { file: { file } }, { dataSources: { transaction } }) =>
      handleAddTransactions(file, transaction),
  },
  Transaction: {
    id: ({ _id }) => _id,
  },
};

export default resolvers;
