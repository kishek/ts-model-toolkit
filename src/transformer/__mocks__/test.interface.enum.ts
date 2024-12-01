import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceStructureWithEnum: ParserResult.Structure = {
  name: 'TestInterfaceWithEnumProperty',
  type: ParserResult.StructureType.INTERFACE,
  comment: 'This is a test interface with an enum property.',
  imports: [
    {
      name: 'TestEnum',
      path: './test.enum',
    },
  ],
  properties: [
    {
      name: 'myEnumProperty',
      comment: 'A enum property with a specific value.',
      imports: [
        {
          name: 'TestEnum',
          path: './test.enum',
        },
      ],
      isRequired: true,
      type: {
        raw: 'TestEnum',
        kind: {
          value: SyntaxKind.Identifier,
          name: 'Identifier',
        },
        defaultValue: {
          raw: 'ENUM_KEY_STRING',
          kind: {
            value: SyntaxKind.Identifier,
            name: 'Identifier',
          },
        },
        typeArguments: [],
      },
    },
  ],
  extendingStructures: [],
  typeParameters: [],
  typeArguments: [],
  path: '../parser/__mocks__/test.interface.with.enum.ts',
};
