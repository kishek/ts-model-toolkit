import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testStringType: ParserResult.Type = {
  raw: 'literal',
  kind: {
    value: SyntaxKind.StringKeyword,
    name: 'StringKeyword',
  },
};
