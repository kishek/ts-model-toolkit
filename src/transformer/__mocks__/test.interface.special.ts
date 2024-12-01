import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceSpecialStructure: ParserResult.Structure = {
  name: 'TestInterfaceWithSpecialProperties',
  type: ParserResult.StructureType.INTERFACE,
  comment:
    'This is a test interface with special properties, requiring special handling.',
  imports: [],
  properties: [
    {
      name: 'myDateProperty',
      comment: 'A date property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'Date',
        kind: {
          value: SyntaxKind.TypeReference,
          name: 'TypeReference',
        },
        typeArguments: [],
      },
    },
  ],
  extendingStructures: [],
  typeParameters: [],
  typeArguments: [],
  path: path.resolve('./foo.ts'),
};
