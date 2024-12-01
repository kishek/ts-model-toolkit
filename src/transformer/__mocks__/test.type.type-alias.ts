import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testTypeAliasType: ParserResult.Type = {
  raw: 'TestTypeAlias',
  kind: {
    value: SyntaxKind.TypeReference,
    name: 'TypeReference',
  },
  typeArguments: [],
};
