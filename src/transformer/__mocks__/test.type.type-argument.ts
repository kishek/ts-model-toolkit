import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testTypeArgumentType: ParserResult.Type = {
  raw: 'TestRelationship',
  kind: {
    value: SyntaxKind.TypeReference,
    name: 'TypeReference',
  },
  typeArguments: [
    {
      raw: 'TestNode',
      kind: {
        value: SyntaxKind.TypeReference,
        name: 'TypeReference',
      },
    },
  ],
};
