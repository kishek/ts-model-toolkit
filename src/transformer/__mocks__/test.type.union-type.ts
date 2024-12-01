import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testUnionType: ParserResult.Type = {
  raw: 'string | number | boolean',
  kind: {
    value: SyntaxKind.UnionType,
    name: 'UnionType',
  },
  elements: [
    {
      raw: 'string',
      kind: {
        value: SyntaxKind.StringKeyword,
        name: 'StringKeyword',
      },
    },
    {
      raw: 'number',
      kind: {
        value: SyntaxKind.NumberKeyword,
        name: 'NumberKeyword',
      },
    },
    {
      raw: 'boolean',
      kind: {
        value: SyntaxKind.BooleanKeyword,
        name: 'BooleanKeyword',
      },
    },
  ],
};
