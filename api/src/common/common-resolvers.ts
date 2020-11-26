import { Resolvers } from '../generated/graphql';
import { DateTimeResolver } from 'graphql-scalars';

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Page: {
    __resolveType: () => 'TransactionPage',
  },
  PageItem: {
    __resolveType: () => 'Transaction',
  },
};

export default resolvers;
