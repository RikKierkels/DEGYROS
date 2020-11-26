import { TransactionsDb } from '../apollo';
import { Maybe, PageInput, ResolversTypes } from '../generated/graphql';
import paginated from '../common/paginated';

export const handleGetTransactions = async (
  transactionsDb: TransactionsDb,
  page?: Maybe<PageInput>,
): Promise<ResolversTypes['TransactionPage']> => {
  page = page || { size: 0, offset: 0 };

  const transactions = await transactionsDb.collection
    .find()
    .skip(page.offset)
    .limit(page.size)
    .sort({ purchaseDate: -1 })
    .toArray();

  return paginated(transactions, page, await transactionsDb.collection.countDocuments());
};
