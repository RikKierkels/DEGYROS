import { DateTimeResolver } from 'graphql-scalars';
import { Resolvers } from '../generated/graphql';

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
