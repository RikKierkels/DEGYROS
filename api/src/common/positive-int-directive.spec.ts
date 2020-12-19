import { ApolloServer, gql, makeExecutableSchema, SchemaDirectiveVisitor, UserInputError } from 'apollo-server';
import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing';
import { DocumentNode } from 'graphql';
import { isPositiveIntDirective } from './positive-int-directive';

const createApolloTestClient = (
  typeDefs: DocumentNode,
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>,
): ApolloServerTestClient => {
  const server = new ApolloServer({ schema: makeExecutableSchema({ typeDefs, schemaDirectives }) });
  return createTestClient(server as any);
};

test('when applied to a non-scalar type, throws an error', () => {
  const typeDefs = gql`
    directive @isPositive on INPUT_FIELD_DEFINITION

    input AuthorInput {
      name: String
    }

    input BookInput {
      author: AuthorInput @isPositive
    }
  `;

  expect(() => createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective })).toThrowError(
    'isPositive directive was applied to a non-scalar type: AuthorInput',
  );
});

test('when applied to an invalid scalar type, throws an error', () => {
  const typeDefs = gql`
    directive @isPositive on INPUT_FIELD_DEFINITION

    input BookInput {
      title: String @isPositive
    }
  `;

  expect(() => createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective })).toThrowError(
    'isPositive directive cannot be applied to scalar of type String',
  );
});

describe('when applied to an int scalar type', () => {
  const typeDefs = gql`
    directive @isPositive on INPUT_FIELD_DEFINITION

    type Query {
      book: Book
    }

    type Mutation {
      createBook(input: BookInput): Book
    }

    input BookInput {
      pages: Int! @isPositive
      chapters: Int @isPositive
    }

    type Book {
      pages: Int
    }
  `;

  const createBookMutation = gql`
    mutation createBook($input: BookInput) {
      createBook(input: $input) {
        pages
      }
    }
  `;

  it('that is non nullable, with a negative integer, throws an error', async () => {
    const { mutate } = createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective });

    const { errors } = await mutate({ mutation: createBookMutation, variables: { input: { pages: -10 } } });

    expect(errors).toHaveLength(1);
    expect(errors?.[0].message).toContain('pages must be a positive integer');
    expect(errors?.[0].extensions).toEqual({ code: 'BAD_USER_INPUT' });
  });

  it('that is non nullable, with a positive integer, does not throw an error', async () => {
    const { mutate } = createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective });

    const { errors } = await mutate({ mutation: createBookMutation, variables: { input: { pages: 10 } } });

    expect(errors).toBeUndefined();
  });

  it('with a negative integer, throws an error', async () => {
    const { mutate } = createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective });

    const { errors } = await mutate({
      mutation: createBookMutation,
      variables: { input: { pages: 10, chapters: 0 } },
    });

    expect(errors).toHaveLength(1);
    expect(errors?.[0].message).toContain('chapters must be a positive integer');
    expect(errors?.[0].extensions).toEqual({ code: 'BAD_USER_INPUT' });
  });

  it('with a positive integer, does not throw an error', async () => {
    const { mutate } = createApolloTestClient(typeDefs, { isPositive: isPositiveIntDirective });

    const { errors } = await mutate({
      mutation: createBookMutation,
      variables: { input: { pages: 10, chapters: 10 } },
    });

    expect(errors).toBeUndefined();
  });
});
