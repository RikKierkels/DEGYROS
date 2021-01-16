import { DateTimeResolver } from 'graphql-scalars';
import { Resolvers } from '../generated/graphql';

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
};

export default resolvers;
