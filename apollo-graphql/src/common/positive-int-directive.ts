import { SchemaDirectiveVisitor, SchemaError, UserInputError } from 'apollo-server';
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
      throw new SchemaError(`${this.name} directive was applied to a non-scalar type: ${nullableType}`);
    }

    if (!isScalarIntType(nullableType)) {
      throw new SchemaError(`${this.name} directive cannot be applied to scalar of type ${nullableType}`);
    }

    const PosIntType = new PositiveIntType(field.name, nullableType);
    field.type = isNonNullType(field.type) ? new GraphQLNonNull(PosIntType) : PosIntType;
  }
}

class PositiveIntType extends GraphQLScalarType {
  constructor(fieldName: string, type: GraphQLScalarType) {
    const validate = (value: number): number => {
      if (Math.sign(value) === 1) return value;
      throw new UserInputError(`${fieldName} must be a positive integer`);
    };

    super({
      name: `Positive_${fieldName}`,

      serialize(value: number): number {
        value = type.serialize(value);
        return validate(value);
      },

      parseValue(value: number): number {
        value = type.serialize(value);
        return type.parseValue(validate(value));
      },

      parseLiteral(ast: ValueNode): number {
        const value = type.parseLiteral(ast, null);
        return validate(value);
      },
    });
  }
}
