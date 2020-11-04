import { Resolvers } from '../generated/graphql';
import { Context } from '../apollo';

const resolvers: Resolvers<Context> = {
  Query: {
    transactions: (parent, args, { dataSources: { transaction } }) => {
      return transaction.collection.find().toArray();
    },
  },
  Transaction: {
    id: ({ _id }) => _id.toHexString(),
    purchaseDate: ({ purchaseDate }) => Date.parse(purchaseDate),
  },
};

export default resolvers;
