import { gql } from 'apollo-server';
import { createApolloTestClient } from '../common/apollo-test';

test('can retrieve transactions', async () => {
  const transactionsQuery = gql`
    fragment priceFields on Price {
      amount
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
  const { query } = createApolloTestClient();

  const { data, errors } = await query({ query: transactionsQuery });

  expect(errors).toBeUndefined();
  expect(data).toMatchInlineSnapshot({});
});
