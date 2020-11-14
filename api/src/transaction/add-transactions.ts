import { FileUpload } from 'graphql-upload';
import { DataSources } from '../apollo';
import { parse } from 'papaparse';
import parseDate from 'date-fns/parse';
import { Price, TransactionDbObject } from '../generated/graphql';
import { ReadStream } from 'fs-capacitor';

type TransactionCsvRow = {
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

export const handleAddTransactions = async (
  file: FileUpload,
  transactions: DataSources['transaction'],
): Promise<TransactionDbObject[]> => {
  const { mimetype, createReadStream } = file;

  if (mimetype !== 'text/csv') {
    throw Error('Invalid file type, should be text/csv');
  }

  const fileStream = createReadStream();
  const csv = await readableToString(fileStream);
  const transactionCsvRows = parseTransactionsCsv(csv);

  const existingTransactions = await transactions.findManyById(transactionCsvRows.map(({ orderId }) => orderId));
  const transactionsToAdd = transactionCsvRows.filter(isNotIncludedIn(existingTransactions)).map(toTransactionDbObject);
  await transactions.collection.insertMany(transactionsToAdd);

  return transactions.collection.find().toArray();
};

const readableToString = (readable: ReadStream): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    readable.on('data', (chunk) => (data += chunk));
    readable.on('end', () => resolve(data));
    readable.on('error', (error) => reject(error));
  });

const parseTransactionsCsv = (csv: string): TransactionCsvRow[] =>
  parse<TransactionCsvRow>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transform(value: string): any {
      return value ? value : undefined;
    },
    transformHeader(_, index: number): string {
      return [
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
      ][index];
    },
  }).data;

const isNotIncludedIn = (transactions: TransactionDbObject[]) => ({ orderId }: TransactionCsvRow): boolean =>
  transactions.every((transaction) => transaction._id !== orderId);

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
}: TransactionCsvRow): TransactionDbObject => ({
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

const toDateIso = (date: string, time: string): string => {
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

const getNumberOfDecimals = (value: number): number => {
  const [, decimals] = value.toString().split('.');
  return (decimals || '').length;
};

const toWholeNumber = (value: number, numberOfDecimals: number): number => Math.round(value * 10 ** numberOfDecimals);
