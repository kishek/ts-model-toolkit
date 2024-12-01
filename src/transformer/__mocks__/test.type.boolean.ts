import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testBooleanType: ParserResult.Type = {
  raw: 'literal',
  kind: {
    value: SyntaxKind.BooleanKeyword,
    name: 'BooleanKeyword',
  },
};
