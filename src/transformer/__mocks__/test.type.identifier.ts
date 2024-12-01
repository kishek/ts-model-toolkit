import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testIdentifierType: ParserResult.Type = {
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
};
