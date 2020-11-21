import { TransactionsDb } from '../apollo';
import { TransactionDbObject } from '../generated/graphql';

export const handleGetTransactions = async (transactionsDb: TransactionsDb): Promise<TransactionDbObject[]> => {
  return transactionsDb.collection.find().toArray().then(sortByPurchaseDate);
};

const sortByPurchaseDate = (transactions: TransactionDbObject[]): TransactionDbObject[] =>
  transactions.sort(({ purchaseDate: a }, { purchaseDate: b }) => (a < b ? -1 : a > b ? 1 : 0));
