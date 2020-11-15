import { FileUpload } from 'graphql-upload';
import { DataSources } from '../apollo';
import parseDate from 'date-fns/parse';
import { Price, TransactionDbObject } from '../generated/graphql';
import { parseCsv } from '../common/csv-parser';
import { UserInputError } from 'apollo-server';
import { mapStreamTo } from '../common/utils';

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

export const handleAddTransactions = async (file: FileUpload, transactionsDb: DataSources['transactionsDb']) => {
  const { mimetype, createReadStream } = file;

  if (mimetype !== 'text/csv') {
    throw new UserInputError('Invalid file type. Only text/csv is supported.');
  }

  const { data: transactionsInCsv, errors } = await parseTransactionsFromStream(createReadStream());
  if (errors.length) {
    throw new UserInputError(
      'Invalid CSV file input',
      errors.reduce((props, error) => (props[error.row] = error.message), Object.create(null)),
    );
  }

  const transactionsInDb = await transactionsDb.findManyById(transactionsInCsv.map(({ orderId }) => orderId));
  const transactionsToAdd = transactionsInCsv
    .filter(isTransactionUnique)
    .filter(isTransactionNotIncludedIn(transactionsInDb))
    .map(toTransactionDbObject);

  return transactionsToAdd.length
    ? transactionsDb.collection.insertMany(transactionsToAdd).then(() => transactionsDb.collection.find().toArray())
    : transactionsDb.collection.find().toArray();
};

const isTransactionUnique = (transaction: TransactionCsv, index: number, self: TransactionCsv[]) =>
  self.findIndex(({ orderId }) => transaction.orderId === orderId) === index;

const isTransactionNotIncludedIn = (transactions: TransactionDbObject[]) => (transaction: TransactionCsv) =>
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
  purchaseDate: toDateIso(date, time),
  product,
  ISIN,
  exchange,
  count,
  rate: toPrice(rate, rateCurrency),
  purchaseValue: toPrice(purchaseValue, purchaseValueCurrency),
  costs: toPrice(costs, costsCurrency),
  total: toPrice(total, totalCurrency),
});

const toDateIso = (date: string, time: string) => {
  return parseDate(`${date} ${time}`, 'dd-MM-yyyy HH:mm', new Date()).toISOString();
};

const toPrice = (amount: number = 0, currency: string = ''): Price => {
  const numberOfDecimals = getNumberOfDecimals(amount);

  return {
    amount: toWholeNumber(amount, numberOfDecimals),
    currency,
    numberOfDecimals,
  };
};

const getNumberOfDecimals = (value: number) => {
  const [, decimals] = value.toString().split('.');
  return (decimals || '').length;
};

const toWholeNumber = (value: number, numberOfDecimals: number) => Math.round(value * 10 ** numberOfDecimals);
