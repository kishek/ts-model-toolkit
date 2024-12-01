import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testTypeReferenceType: ParserResult.Type = {
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
};
