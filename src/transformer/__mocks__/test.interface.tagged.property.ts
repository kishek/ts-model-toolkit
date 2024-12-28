import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceWithTaggedProperty: ParserResult.Structure = {
  name: 'TestInterfaceWithTaggedProperty',
  type: ParserResult.StructureType.INTERFACE,
  comment: 'This is a test interface with an array property.',
  tags: [],
  imports: [
    {
      name: 'TestEnum',
      path: './test.enum',
    },
  ],
  properties: [
    {
      name: 'myFloatProperty',
      comment: 'A array property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'number',
        kind: {
          value: SyntaxKind.NumberKeyword,
          name: 'NumberKeyword',
        },
      },
      tags: [['float', '']],
    },
  ],
  extendingStructures: [],
  typeParameters: [],
  typeArguments: [],
  path: path.resolve('./foo.ts'),
};
