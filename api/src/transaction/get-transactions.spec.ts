import { gql } from 'apollo-server';
import { createApolloTestClient, createMongoMemoryClient, MongoMemoryClient } from '../common/test-utils';
import { createDataSources } from '../apollo';

let mongoClient: MongoMemoryClient;

beforeEach(async () => {
  mongoClient = await createMongoMemoryClient();
});

afterEach(async () => {
  return mongoClient.stop();
});

test('given existing transactions, when retrieving transactions, returns all transactions', async () => {
  const dataSources = createDataSources(mongoClient.instance());
  const { query } = createApolloTestClient(dataSources);

  await dataSources.transaction.collection.insertMany([
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
  ]);

  const transactionsQuery = gql`
    fragment priceFields on Price {
      amount
      numberOfDecimals
      currency
    }

    query transactions {
      transactions {
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

  const { data, errors } = await query({ query: transactionsQuery });

  expect(errors).toBeUndefined();
  expect(data).toMatchSnapshot();
});
