import { SourceFile, SyntaxKind } from 'ts-morph';

import { Transformer } from '..';
import { ParserResult } from '../../parser/types';

export class BuilderBaseTransformer extends Transformer {
  /**
   * Translates between a parser type and a TypeScript type.
   */
  protected getPropertyType(
    type: ParserResult.Type,
    imports: ParserResult.Import[],
    builderFile: SourceFile,
    typeParameters: ParserResult.Type[] = [],
  ): string {
    // Small wrapper for returning some types with imports.
    const withImport = (rawType = type) => {
      this.addImport({
        importIdentifier: rawType.raw,
        imports,
        file: builderFile,
      });
      return rawType.raw;
    };

    // NOTE: if a type has been supplied, this means that the
    // current type needs to be overriden.
    if (type.suppliedValue) {
      return this.getPropertyType(
        type.suppliedValue,
        imports,
        builderFile,
        typeParameters,
      );
    }

    switch (type.kind.value) {
      case SyntaxKind.StringKeyword:
        return 'string';
      case SyntaxKind.NumberKeyword:
        return 'number';
      case SyntaxKind.BooleanKeyword:
        return 'boolean';
      case SyntaxKind.InterfaceDeclaration:
        return type.raw;
      case SyntaxKind.Identifier:
        if (type.defaultValue) {
          return `${withImport(type)}.${type.defaultValue.raw}`;
        }
        return type.raw;
      case SyntaxKind.TypeReference: {
        if (type.defaultValue || type.constraintValue) {
          // NOTE: in this case, we make a strong assumption that the type parameter
          // required by this property is already a type parameter on the interface.
          // In this case, the builder statement can fallback to the 'generic' type
          // parameter which has been defined as part of the interface.
          // --------------------------------------------------------------------
          // TODO: add support for 'finding' the correct type parameter.
          if (typeParameters.length === 1) {
            return withImport(type);
          }
          return withImport(type.defaultValue || type.constraintValue);
        }
        if (type.typeArguments?.length === 1) {
          const typeArgument = withImport(type.typeArguments[0]);
          const typeReference = withImport(type);
          return `${typeReference}<${typeArgument}>`;
        }
        return withImport(type);
      }
      case SyntaxKind.ArrayType: {
        const elements = type.elements;
        if (elements) {
          const [element] = elements;
          return `${this.getPropertyType(
            element,
            imports,
            builderFile,
            typeParameters,
          )}[]`;
        }
      }
      case SyntaxKind.UnionType: {
        const elements = type.elements;
        if (elements) {
          return elements
            .map((element) =>
              this.getPropertyType(element, imports, builderFile, typeParameters),
            )
            .join(' | ');
        }
      }
      case SyntaxKind.TupleType: {
        const elements = type.elements;
        if (elements) {
          const [maybeRequired, maybeRest] = elements;
          // NOTE: we relax tuple types into flat arrays if and only if they
          // are composed of a rest type. The rest type will inherently
          // capture the narrowing type at the start, however due to the
          // limitations of GraphQL, cannot be enforced in the schema itself.
          if (maybeRest && maybeRest.kind.value === SyntaxKind.RestType) {
            if (maybeRest.elements) {
              const restElement = maybeRest.elements[0];
              const requiredType = this.getPropertyType(
                maybeRequired,
                imports,
                builderFile,
                typeParameters,
              );
              const restType = this.getPropertyType(
                restElement,
                imports,
                builderFile,
                typeParameters,
              );
              return `[${requiredType}, ...${restType}]`;
            }
          }
        }
      }
      default:
        console.warn(`Woah! ${type.kind.name} unsupported by builder transformer 😱`);
        return 'Unknown';
    }
  }
}
