import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: Taken from parser-declaration-enum.test.ts.
export const testEnumStructure: ParserResult.Structure = {
  name: 'TestEnum',
  type: ParserResult.StructureType.ENUM,
  comment: 'This is a test enum.',
  extendingStructures: [],
  imports: [],
  properties: [
    {
      name: 'ENUM_KEY_STRING',
      comment: 'A test enum key/value pair.',
      type: {
        raw: 'enum-member',
        kind: {
          value: SyntaxKind.EnumMember,
          name: 'EnumMember',
        },
        defaultValue: {
          raw: "'enumValue'",
          kind: {
            value: SyntaxKind.StringKeyword,
            name: 'StringKeyword',
          },
        },
      },
      imports: [],
      isRequired: false,
    },
    {
      name: 'ENUM_KEY_NUMBER',
      comment: 'Another test enum key/value pair',
      type: {
        raw: 'enum-member',
        kind: {
          value: SyntaxKind.EnumMember,
          name: 'EnumMember',
        },
        defaultValue: {
          raw: '5',
          kind: {
            value: SyntaxKind.NumberKeyword,
            name: 'NumberKeyword',
          },
        },
      },
      imports: [],
      isRequired: false,
    },
  ],
  path: path.resolve('./foo.ts'),
};
