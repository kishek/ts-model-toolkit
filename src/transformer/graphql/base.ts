import { SyntaxKind } from 'ts-morph';

import { GraphQLTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

/**
 * Special mappings specific to GraphQL.
 */
export const GQL_MAPPINGS: Record<string, string> = {
  Date: 'String',
};

export class GraphQLBaseTransformer extends Transformer {
  /**
   * A method which translates parser type representations to GQL.
   * @param type
   */
  protected getGraphQLType(type: ParserResult.Type): string {
    const gqlType = this.getGraphQLFromType(type);
    if (GQL_MAPPINGS[gqlType]) {
      return GQL_MAPPINGS[gqlType];
    }
    return gqlType;
  }

  private getGraphQLFromType(type: ParserResult.Type): string {
    // NOTE: if a type has been supplied, this means that the
    // current type needs to be overriden.
    if (type.suppliedValue) {
      return this.getGraphQLFromType(type.suppliedValue);
    }

    switch (type.kind.value) {
      case SyntaxKind.StringKeyword:
        return 'String';
      case SyntaxKind.NumberKeyword:
        return 'Int';
      case SyntaxKind.BooleanKeyword:
        return 'Boolean';
      case SyntaxKind.EnumMember:
        return type.defaultValue?.raw || type.raw;
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.Identifier:
        return type.raw;
      case SyntaxKind.TypeReference: {
        if (type.defaultValue) {
          return type.defaultValue.raw;
        }
        if (type.constraintValue) {
          return type.constraintValue.raw;
        }
        if (type.typeArguments && type.typeArguments.length === 1) {
          return type.typeArguments[0].raw;
        }
        return type.raw;
      }
      case SyntaxKind.ArrayType: {
        const elements = type.elements;
        if (elements) {
          const [element] = elements;
          return `[${this.getGraphQLFromType(element)}]`;
        }
      }
      case SyntaxKind.UnionType: {
        const elements = type.elements;
        if (elements) {
          return elements.map(this.getGraphQLFromType.bind(this)).join(' | ');
        }
      }
      case SyntaxKind.TupleType: {
        const elements = type.elements;
        if (elements) {
          const [, maybeRest] = elements;
          // NOTE: we relax tuple types into flat arrays if and only if they
          // are composed of a rest type. The rest type will inherently
          // capture the narrowing type at the start, however due to the
          // limitations of GraphQL, cannot be enforced in the schema itself.
          if (maybeRest && maybeRest.kind.value === SyntaxKind.RestType) {
            if (maybeRest.elements) {
              return this.getGraphQLFromType(maybeRest.elements[0]);
            }
          }
        }
      }
      default:
        console.warn(`Woah! ${type.kind.name} unsupported by GraphQL transformer 😱`);
        return 'Unknown';
    }
  }

  public getGraphQLNullableMarker(
    property: ParserResult.Property,
    opts?: GraphQLTransformerOpts,
  ): string {
    if (opts?.inheritNullabilityFromStructure) {
      if (property.isRequired) {
        return '!';
      }
      return '';
    }
    return '';
  }
}
