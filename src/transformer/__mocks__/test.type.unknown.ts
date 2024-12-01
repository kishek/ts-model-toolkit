import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testUnknownType: ParserResult.Type = {
  raw: 'unknown',
  kind: {
    value: SyntaxKind.Unknown,
    name: 'UnknownKeyword',
  },
};
