import { UserInputError } from 'apollo-server';
import parse from 'date-fns/parse';
import { FileUpload } from 'graphql-upload';
import { TransactionsDb } from '../apollo';
import { formatErrorMessagesByCode, parseCsv } from '../common/csv-parser';
import { mapStreamTo } from '../common/utils';
import { Price, TransactionDbObject } from '../generated/graphql';

type TransactionCsv = {
  date: string;
  time: string;
  product: string;
  ISIN: string;
  exchange: string;
  count: number;
  rateCurrency: string;
  rate: number;
  localValueCurrency: string;
  localValue: number;
  purchaseValueCurrency: string;
  purchaseValue: number;
  exchangeRate: number;
  costsCurrency: string;
  costs: number;
  totalCurrency: string;
  total: number;
  orderId: string;
};

const parseTransactions = parseCsv<TransactionCsv>(
  [
    'date',
    'time',
    'product',
    'ISIN',
    'exchange',
    'count',
    'rateCurrency',
    'rate',
    'localValueCurrency',
    'localValue',
    'purchaseValueCurrency',
    'purchaseValue',
    'exchangeRate',
    'costsCurrency',
    'costs',
    'totalCurrency',
    'total',
    'orderId',
  ],
  (value) => (value ? value : undefined),
);
const parseTransactionsFromStream = mapStreamTo(parseTransactions);

export const handleAddTransactions = async (
  transactionsDb: TransactionsDb,
  file: FileUpload,
): Promise<TransactionDbObject[]> => {
  const { mimetype, createReadStream } = file;

  if (mimetype !== 'text/csv') {
    throw new UserInputError('Invalid file type. Only text/csv is supported.');
  }

  const { data: transactionsFromCsv, errors } = await parseTransactionsFromStream(createReadStream());
  if (errors.length) {
    throw new UserInputError('Invalid csv file', formatErrorMessagesByCode(errors));
  }

  const transactionsFromDb = await transactionsDb.findManyById(transactionsFromCsv.map(({ orderId }) => orderId));
  const transactionsToAdd = transactionsFromCsv
    .filter(isTransactionUnique)
    .filter(isTransactionMissingFrom(transactionsFromDb))
    .map(toTransactionDbObject);

  return transactionsDb.insertManySafe(transactionsToAdd).then((result) => result?.ops || []);
};

const isTransactionUnique = (transaction: TransactionCsv, index: number, self: TransactionCsv[]): boolean =>
  self.findIndex(({ orderId }) => transaction.orderId === orderId) === index;

const isTransactionMissingFrom = (transactions: TransactionDbObject[]) => (transaction: TransactionCsv): boolean =>
  transactions.findIndex(({ _id }) => transaction.orderId === _id) === -1;

const toTransactionDbObject = ({
  orderId,
  date,
  time,
  product,
  ISIN,
  exchange,
  count,
  rate,
  rateCurrency,
  purchaseValue,
  purchaseValueCurrency,
  costs,
  costsCurrency,
  total,
  totalCurrency,
}: TransactionCsv): TransactionDbObject => ({
  _id: orderId,
  purchaseDate: parseToISODate(date, time),
  product,
  ISIN,
  exchange,
  count,
  rate: toPrice(rate, rateCurrency),
  purchaseValue: toPrice(purchaseValue, purchaseValueCurrency),
  costs: toPrice(costs, costsCurrency),
  total: toPrice(total, totalCurrency),
});

const parseToISODate = (date: string, time: string): string => {
  return parse(`${date} ${time}`, 'dd-MM-yyyy HH:mm', new Date()).toISOString();
};

const toPrice = (amount: number = 0, currency: string = ''): Price => {
  const numberOfDecimals = getNumberOfDecimals(amount);

  return {
    amount: toWholeNumber(amount, numberOfDecimals),
    currency,
    numberOfDecimals,
  };
};

const getNumberOfDecimals = (value: number): number => {
  const [, decimals] = value.toString().split('.');
  return (decimals || '').length;
};

const toWholeNumber = (value: number, numberOfDecimals: number): number => Math.round(value * 10 ** numberOfDecimals);
