import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server';
import {
  GraphQLFloat,
  GraphQLInputField,
  GraphQLInputType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLScalarType,
  isNonNullType,
  isScalarType,
  ValueNode,
} from 'graphql';

const isScalarIntType = (type: GraphQLInputType) => type === GraphQLInt || type === GraphQLFloat;

export class isPositiveIntDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field: GraphQLInputField): void {
    this.wrapType(field);
  }

  wrapType(field: GraphQLInputField): void {
    const nullableType = isNonNullType(field.type) ? field.type.ofType : field.type;

    if (!isScalarType(nullableType)) {
      throw new Error(`${this.name} directive was applied to a non-scalar type: ${nullableType}`);
    }

    if (!isScalarIntType(nullableType)) {
      throw new Error(`${this.name} directive cannot be applied to scalar of type ${nullableType}`);
    }

    const PosIntType = new PositiveIntType(field.name, nullableType);
    field.type = isNonNullType(field.type) ? new GraphQLNonNull(PosIntType) : PosIntType;
  }
}

const isPositiveInt = (value: number) => Math.sign(value) === 1;
const validate = (name: string) => (value: number) => {
  if (isPositiveInt(value)) return value;
  throw new UserInputError(`${name} must be a positive integer`);
};

class PositiveIntType extends GraphQLScalarType {
  constructor(fieldName: string, type: GraphQLScalarType) {
    const validator = validate(fieldName);

    super({
      name: `Positive_${fieldName}`,

      serialize(value: number): number {
        value = type.serialize(value);
        return validator(value);
      },

      parseValue(value: number): number {
        value = type.serialize(value);
        return type.parseValue(validator(value));
      },

      parseLiteral(ast: ValueNode): number {
        const value = type.parseLiteral(ast, null);
        return validator(value);
      },
    });
  }
}
