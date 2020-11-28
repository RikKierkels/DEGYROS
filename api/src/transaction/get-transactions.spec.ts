import { gql } from 'apollo-server';
import { createDataSources } from '../apollo';
import { createApolloTestClient, createMongoMemoryClient, MongoMemoryClient } from '../common/test-utils';

let mongoClient: MongoMemoryClient;

beforeEach(async () => {
  mongoClient = await createMongoMemoryClient();
});

afterEach(async () => {
  return mongoClient.stop();
});

const transactionsQuery = gql`
  fragment priceFields on Price {
    amount
    numberOfDecimals
    currency
  }

  query transactions($page: PageInput) {
    transactions(page: $page) {
      items {
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
      size
      offset
      total
    }
  }
`;

test('given existing transactions, when retrieving transactions with an offset and limit, returns the transactions matching the limit and offset', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { query } = createApolloTestClient(dataSources);

  await dataSources.transactionsDb.collection.insertMany([
    {
      _id: '29f09ed1-684c-4df3-8295-e12b7e8460d6',
      purchaseDate: '2020-12-31T09:55:00.000Z',
      product: 'VANGUARD S&P500',
      ISIN: 'IE00B3XXRP09',
      exchange: 'EAM',
      count: 2,
      rate: {
        amount: 54981,
        numberOfDecimals: 3,
        currency: 'EUR',
      },
      purchaseValue: {
        amount: 10996,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      costs: {
        amount: 0,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      total: {
        amount: 10996,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
    },
    {
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
    },
    {
      _id: '3dfd8f62-7d5a-4451-8fc6-875834b3aa9e',
      purchaseDate: '2020-08-31T08:00:00.000Z',
      product: 'HSBC MSCI WORLD',
      ISIN: 'IE00B4X9L533',
      exchange: 'EPA',
      count: 8,
      rate: {
        amount: 2077,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      purchaseValue: {
        amount: -16616,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      costs: {
        amount: 0,
        numberOfDecimals: 0,
        currency: '',
      },
      total: {
        amount: -16616,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
    },
  ]);

  const { data, errors } = await query({
    query: transactionsQuery,
    variables: {
      page: {
        size: 1,
        offset: 2,
      },
    },
  });

  expect(errors).toBeUndefined();
  expect(data).toMatchSnapshot();
});

test('given existing transactions, when retrieving transactions without an offset and limit, returns all transactions', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { query } = createApolloTestClient(dataSources);

  await dataSources.transactionsDb.collection.insertMany([
    {
      _id: '29f09ed1-684c-4df3-8295-e12b7e8460d6',
      purchaseDate: '2020-12-31T09:55:00.000Z',
      product: 'VANGUARD S&P500',
      ISIN: 'IE00B3XXRP09',
      exchange: 'EAM',
      count: 2,
      rate: {
        amount: 54981,
        numberOfDecimals: 3,
        currency: 'EUR',
      },
      purchaseValue: {
        amount: 10996,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      costs: {
        amount: 0,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
      total: {
        amount: 10996,
        numberOfDecimals: 2,
        currency: 'EUR',
      },
    },
    {
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
    },
  ]);

  const { data, errors } = await query({ query: transactionsQuery });

  expect(errors).toBeUndefined();
  expect(data).toMatchSnapshot();
});
