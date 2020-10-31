import { Resolvers } from '../generated/graphql';
import { DateTimeResolver } from 'graphql-scalars';

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
};

export default resolvers;
