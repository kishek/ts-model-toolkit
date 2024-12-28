import flattenDeep from 'lodash.flattendeep';
import {
  EntityName,
  JSDocableNode,
  JSDocableNodeStructure,
  SyntaxKind,
  TypeNode,
} from 'ts-morph';

import { SupportedDeclaration, ParserResult, KindName } from './types';
import { getImportForType, getImportRelativeToSourceFile } from './util';

/**
 * A parser must implement the following methods.
 */
export abstract class Parser<DeclarationType extends SupportedDeclaration> {
  /**
   * A method which accepts a supported declaration and produces a parsed structure.
   */
  public parse(_declaration: DeclarationType): ParserResult.Structure {
    throw new Error(`Parser.parse needs implementation.`);
  }

  /**
   * A method which extracts comments generically.
   */
  protected getComment(maybeJsDoc: JSDocableNodeStructure): string {
    const stripBeforeReturn = (doc: string) => doc.replace(/\n/, '').replace(/\n/g, ' ');

    if (maybeJsDoc.docs && maybeJsDoc.docs.length > 0) {
      const doc = maybeJsDoc.docs[0];
      if (typeof doc === 'string') {
        return stripBeforeReturn(doc);
      } else {
        if (typeof doc.description === 'string') {
          return stripBeforeReturn(doc.description);
        }
        if (typeof doc.leadingTrivia === 'string') {
          return stripBeforeReturn(doc.leadingTrivia);
        }
      }
    }
    throw new Error(`No documentation found for element.`);
  }

  /**
   * A method which extracts imports for current declaration.
   */
  protected getImports(declaration: SupportedDeclaration): ParserResult.Import[] {
    const importDeclarations = declaration.getSourceFile().getImportDeclarations();
    return flattenDeep(
      importDeclarations.map((importDeclaration) => {
        const namedImportDeclarations = importDeclaration.getNamedImports();
        return namedImportDeclarations.map((namedImportDeclaration) => ({
          name: namedImportDeclaration.getName(),
          path: importDeclaration.getModuleSpecifierValue(),
        }));
      }),
    );
  }

  /**
   * A method which gets a type representation from a bare string.
   */
  protected getType(type: string): ParserResult.Type {
    switch (type) {
      case 'string':
        return {
          raw: 'literal',
          kind: {
            value: SyntaxKind.StringKeyword,
            name: 'StringKeyword',
          },
        };
      case 'number':
        return {
          raw: 'literal',
          kind: {
            value: SyntaxKind.NumberKeyword,
            name: 'NumberKeyword',
          },
        };
      case 'boolean':
        return {
          raw: 'literal',
          kind: {
            value: SyntaxKind.BooleanKeyword,
            name: 'BooleanKeyword',
          },
        };
      default:
        return {
          raw: type,
          // NOTE: we only allow interface declarations to be composed in types in the default case.
          // This is a deliberate decision taken to reduce complexity.
          kind: {
            value: SyntaxKind.InterfaceDeclaration,
            name: 'InterfaceDeclaration',
          },
        };
    }
  }

  protected getTags(node: JSDocableNode): [string, string][] {
    return node
      .getJsDocs()
      .flatMap((j) =>
        j
          .getTags()
          .map((t) => [t.getTagName(), t.getCommentText() ?? ''] as [string, string]),
      );
  }

  /**
   * Small utility method which converts type nodes to parser types.
   */
  protected toType(node: TypeNode | EntityName): ParserResult.Type {
    return {
      // NOTE: we split off any type parameter used in this type, so we grab the raw name.
      raw: node.getText().split('<')[0],
      kind: {
        value: node.getKind(),
        name: node.getKindName() as KindName,
      },
    };
  }

  /**
   * Small utility method which enhances a parser type with imports.
   */
  protected withPath(
    type: ParserResult.Type,
    importOpts?: { declaredIn: string; imports: ParserResult.Import[] },
  ): ParserResult.Type {
    // Enhance type with source path information if applicable.
    if (importOpts) {
      const typeImport = getImportForType(type, importOpts.imports);
      const typeImportRelative = getImportRelativeToSourceFile(
        importOpts.declaredIn,
        typeImport,
      );
      type.path = typeImportRelative;
    }

    return type;
  }
}
