import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testTupleAndRestType: ParserResult.Type = {
  raw: '[TestEnum.ENUM_KEY_STRING, ...TestEnum[]]',
  kind: {
    value: SyntaxKind.TupleType,
    name: 'TupleType',
  },
  elements: [
    {
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
    {
      raw: '...TestEnum[]',
      kind: {
        value: SyntaxKind.RestType,
        name: 'RestType',
      },
      elements: [
        {
          raw: 'TestEnum[]',
          kind: {
            value: SyntaxKind.ArrayType,
            name: 'ArrayType',
          },
          elements: [
            {
              raw: 'TestEnum',
              kind: {
                value: SyntaxKind.TypeReference,
                name: 'TypeReference',
              },
              typeArguments: [],
            },
          ],
        },
      ],
    },
  ],
};
