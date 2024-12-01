import { TypeAliasDeclaration, TypeAliasDeclarationStructure } from 'ts-morph';

import { Parser } from './parser-base';
import { ParserResult } from './types';
import { sanitizePath } from './util';

export class TypeAliasParser extends Parser<TypeAliasDeclaration> {
  public parse(declaration: TypeAliasDeclaration): ParserResult.Structure {
    const structure = declaration.getStructure();
    const path = declaration.getSourceFile().getFilePath();

    return {
      type: ParserResult.StructureType.TYPE_ALIAS,
      typeAliases: this.getTypeAliases(structure.type),
      name: structure.name,
      comment: this.getComment(structure),
      imports: this.getImports(declaration),
      extendingStructures: [],
      properties: [],
      path: sanitizePath(path),
    };
  }

  private getTypeAliases(
    type: TypeAliasDeclarationStructure['type'],
  ): ParserResult.Type[] {
    if (typeof type !== 'string') {
      throw new Error(
        'Only type aliases represented as strings by `ts-morph` are supported.',
      );
    } else {
      const aliases = type
        .split('|')
        .map((a) => a.trim())
        .filter((a) => a.length);
      return aliases.map(this.getType);
    }
  }
}
