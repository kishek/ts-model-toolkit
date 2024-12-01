import { EnumDeclaration, EnumDeclarationStructure, SyntaxKind } from 'ts-morph';

import { Parser } from './parser-base';
import { ParserResult } from './types';
import { sanitizePath } from './util';

export class EnumParser extends Parser<EnumDeclaration> {
  public parse(declaration: EnumDeclaration): ParserResult.Structure {
    const structure = declaration.getStructure();
    const path = declaration.getSourceFile().getFilePath();

    return {
      name: structure.name,
      type: ParserResult.StructureType.ENUM,
      comment: this.getComment(structure),
      extendingStructures: [],
      imports: this.getImports(declaration),
      properties: this.getMembers(structure),
      path: sanitizePath(path),
    };
  }

  private getMembers(structure: EnumDeclarationStructure): ParserResult.Property[] {
    if (structure.members && structure.members.length > 0) {
      return structure.members.map((member) => {
        const memberAsProperty: ParserResult.Property = {
          name: member.name,
          comment: this.getComment(member),
          type: {
            raw: 'enum-member',
            kind: {
              value: SyntaxKind.EnumMember,
              name: 'EnumMember',
            },
          },
          imports: [],
          isRequired: false,
        };

        if (typeof member.initializer === 'string') {
          // We check if the initializer is a number or string.
          // NOTE: these are the only kinds of initializers we currently support to
          // reduce complexity.
          if (!isNaN(Number(member.initializer))) {
            memberAsProperty.type.defaultValue = {
              raw: member.initializer,
              kind: {
                value: SyntaxKind.NumberKeyword,
                name: 'NumberKeyword',
              },
            };
          } else {
            memberAsProperty.type.defaultValue = {
              raw: member.initializer,
              kind: {
                value: SyntaxKind.StringKeyword,
                name: 'StringKeyword',
              },
            };
          }
        }
        return memberAsProperty;
      });
    }
    return [];
  }
}
