import { createApolloTestClient, createMongoMemoryClient, MongoMemoryClient } from '../common/test-utils';
import { createDataSources } from '../apollo';
import { gql } from 'apollo-server';
import { Readable } from 'stream';

let mongoClient: MongoMemoryClient;

beforeEach(async () => {
  mongoClient = await createMongoMemoryClient();
});

afterEach(async () => {
  return mongoClient.stop();
});

const addTransactionsMutation = gql`
  fragment priceFields on Price {
    amount
    numberOfDecimals
    currency
  }

  mutation addTransactions($file: Upload!) {
    addTransactions(file: $file) {
      id
      purchaseDate
      product
      ISIN
      exchange
      count
      rate {
        ...priceFields
      }
      purchaseValue {
        ...priceFields
      }
      costs {
        ...priceFields
      }
      total {
        ...priceFields
      }
    }
  }
`;

const createReadStream = (text: string): Readable => Readable.from(Buffer.from(text));

test('given a file that is not a csv file, when adding transactions, throws an error', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { mutate } = createApolloTestClient(dataSources);

  const { data, errors } = await mutate({
    mutation: addTransactionsMutation,
    variables: {
      file: {
        file: {
          mimetype: 'text/plain',
          createReadStream: () => createReadStream('this is not a csv file'),
        },
      },
    },
  });

  expect(errors).toHaveLength(1);
  expect(errors && errors[0].message).toContain('Invalid file type, should be text/csv');
  expect(data.addTransactions).toBeNull();
});

test('given a valid transactions csv file, when adding transactions, adds the transactions and returns all transactions', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { mutate } = createApolloTestClient(dataSources);

  const csv =
    'Datum,Tijd,Product,ISIN,Exchange,Aantal,,Koers,,Lokale waarde,,Waarde,Wisselkoers,,Kosten,,Totaal,Order Id\n' +
    '26-10-2020,09:21,HSBC MSCI WORLD,IE00B4X9L533,EPA,2,EUR,20.3390,EUR,-40.68,EUR,-40.68,,,,EUR,-40.68,03065814-a998-4876-8b6a-bafdeb26664e\n' +
    '26-10-2020,09:21,VANGUARD S&P500,IE00B3XXRP09,EAM,2,EUR,54.9810,EUR,-109.96,EUR,-109.96,,,,EUR,-109.96,29f09ed1-684c-4df3-8295-e12b7e8460d6\n' +
    '28-09-2020,09:09,HSBC MSCI WORLD,IE00B4X9L533,EPA,8,EUR,20.2510,EUR,-162.01,EUR,-162.01,,,,EUR,-162.01,1548279b-689e-420a-b406-05fc32c09612';

  const { data, errors } = await mutate({
    mutation: addTransactionsMutation,
    variables: {
      file: {
        file: {
          mimetype: 'text/csv',
          createReadStream: () => createReadStream(csv),
        },
      },
    },
  });

  expect(errors).toBeUndefined();
  expect(data).toMatchSnapshot();
});

test('given existing transactions, when adding transactions that already exist, only adds the transactions that dont exist', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { mutate } = createApolloTestClient(dataSources);

  await dataSources.transaction.collection.insertOne({
    _id: '03065814-a998-4876-8b6a-bafdeb26664e',
    purchaseDate: '2020-11-12T21:55:00.000Z',
    product: 'HSBC MSCI WORLD',
    ISIN: 'IE00B4X9L533',
    exchange: 'EPA',
    count: 2,
    rate: {
      amount: 20339,
      numberOfDecimals: 3,
      currency: 'EUR',
    },
    purchaseValue: {
      amount: 4068,
      numberOfDecimals: 2,
      currency: 'EUR',
    },
    costs: {
      amount: 0,
      numberOfDecimals: 2,
      currency: 'EUR',
    },
    total: {
      amount: 4068,
      numberOfDecimals: 2,
      currency: 'EUR',
    },
  });

  const savedTransactionsCount = await dataSources.transaction.collection.countDocuments();
  expect(savedTransactionsCount).toBe(1);

  const csv =
    'Datum,Tijd,Product,ISIN,Exchange,Aantal,,Koers,,Lokale waarde,,Waarde,Wisselkoers,,Kosten,,Totaal,Order Id\n' +
    '26-10-2020,09:21,HSBC MSCI WORLD,IE00B4X9L533,EPA,2,EUR,20.3390,EUR,-40.68,EUR,-40.68,,,,EUR,-40.68,03065814-a998-4876-8b6a-bafdeb26664e\n' +
    '26-10-2020,09:21,VANGUARD S&P500,IE00B3XXRP09,EAM,2,EUR,54.9810,EUR,-109.96,EUR,-109.96,,,,EUR,-109.96,29f09ed1-684c-4df3-8295-e12b7e8460d6\n';

  const { data, errors } = await mutate({
    mutation: addTransactionsMutation,
    variables: {
      file: {
        file: {
          mimetype: 'text/csv',
          createReadStream: () => createReadStream(csv),
        },
      },
    },
  });

  expect(errors).toBeUndefined();
  expect(data.addTransactions).toHaveLength(2);
  expect(data).toMatchSnapshot();
});
