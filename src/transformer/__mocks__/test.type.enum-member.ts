import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testEnumMemberType: ParserResult.Type = {
  raw: 'enum-member',
  kind: {
    value: SyntaxKind.EnumMember,
    name: 'EnumMember',
  },
  defaultValue: {
    raw: "'enumValue'",
    kind: {
      value: SyntaxKind.StringKeyword,
      name: 'StringKeyword',
    },
  },
};
