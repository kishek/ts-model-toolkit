import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: Taken from parser-declaration-type-alias.test.ts.
export const testTypeAliasStructure: ParserResult.Structure = {
  type: ParserResult.StructureType.TYPE_ALIAS,
  typeAliases: [
    {
      raw: 'literal',
      kind: {
        value: SyntaxKind.StringKeyword,
        name: 'StringKeyword',
      },
    },
    {
      raw: 'literal',
      kind: {
        value: SyntaxKind.NumberKeyword,
        name: 'NumberKeyword',
      },
    },
    {
      raw: 'literal',
      kind: {
        value: SyntaxKind.BooleanKeyword,
        name: 'BooleanKeyword',
      },
    },
    {
      raw: 'TestInterface',
      kind: {
        value: SyntaxKind.InterfaceDeclaration,
        name: 'InterfaceDeclaration',
      },
    },
  ],
  name: 'TestTypeAlias',
  comment: 'This is a test type alias.',
  imports: [
    {
      name: 'TestInterface',
      path: './test.interface',
    },
  ],
  extendingStructures: [],
  properties: [],
  path: path.resolve('./foo.ts'),
};
