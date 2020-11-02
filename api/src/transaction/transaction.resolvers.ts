import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: (parent, args, { dataSources: { transactions } }) => {
      return transactions.collection.find().toArray();
    },
  },
  Transaction: {},
};

export default resolvers;
