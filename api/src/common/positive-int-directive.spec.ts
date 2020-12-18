import { ApolloServer, gql, makeExecutableSchema, SchemaDirectiveVisitor } from 'apollo-server';
import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing';
import { DocumentNode } from 'graphql';
import { isPositiveIntDirective } from './positive-int-directive';

const createApolloTestClient = (
  typeDefs: DocumentNode,
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>,
) => (): ApolloServerTestClient => {
  const server = new ApolloServer({ schema: makeExecutableSchema({ typeDefs, schemaDirectives }) });
  return createTestClient(server as any);
};

test('when applied to a non-scalar type, throws an error', () => {
  const typeDefs = gql`
    directive @isPositive on INPUT_FIELD_DEFINITION

    input Author {
      name: String
    }

    input Book {
      author: Author @isPositive
    }
  `;

  expect(createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective })).toThrowError(
    'isPositive directive was applied to a non-scalar type: Author',
  );
});

test('when applied to an invalid scalar type, throws an error', () => {
  const typeDefs = gql`
    directive @isPositive on INPUT_FIELD_DEFINITION

    input Author {
      name: String @isPositive
    }
  `;

  expect(createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective })).toThrowError(
    'isPositive directive cannot be applied to scalar of type String',
  );
});

describe('for a nullable type', () => {
  it('with a negative integer, throws an error', () => {});

  it('with a positive integer, does not throw an error', () => {});
});

describe('for a non nullable type', () => {
  it('with a negative integer, throws an error', () => {});

  it('with a positive integer, does not throw an error', () => {});
});
