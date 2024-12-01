import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testNumberType: ParserResult.Type = {
  raw: 'literal',
  kind: {
    value: SyntaxKind.NumberKeyword,
    name: 'NumberKeyword',
  },
};
