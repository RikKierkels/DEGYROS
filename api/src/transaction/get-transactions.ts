import { TransactionsDb } from '../apollo';
import paginated from '../common/paginated';
import { PageInput, ResolversTypes } from '../generated/graphql';

export const handleGetTransactions = async (
  transactionsDb: TransactionsDb,
  { size, offset }: PageInput,
): Promise<ResolversTypes['TransactionPage']> => {
  const transactions = await transactionsDb.collection
    .find()
    .sort({ purchaseDate: -1 })
    .skip(offset)
    .limit(size)
    .toArray();

  return paginated(transactions, offset, await transactionsDb.collection.countDocuments());
};
