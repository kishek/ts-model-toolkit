import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceBasicStructure: ParserResult.Structure = {
  name: 'TestInterfaceWithBasicProperties',
  type: ParserResult.StructureType.INTERFACE,
  comment: 'This is a test interface.',
  imports: [],
  properties: [
    {
      name: 'myStringProperty',
      comment: 'A string property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'string',
        kind: {
          value: SyntaxKind.StringKeyword,
          name: 'StringKeyword',
        },
      },
    },
    {
      name: 'myNumberProperty',
      comment: 'A number property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'number',
        kind: {
          value: SyntaxKind.NumberKeyword,
          name: 'NumberKeyword',
        },
      },
    },
    {
      name: 'myBooleanProperty',
      comment: 'A boolean property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'boolean',
        kind: {
          value: SyntaxKind.BooleanKeyword,
          name: 'BooleanKeyword',
        },
      },
    },
  ],
  extendingStructures: [],
  typeParameters: [],
  typeArguments: [],
  path: path.resolve('./foo.ts'),
};
