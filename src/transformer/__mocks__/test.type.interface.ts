import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testInterfaceType: ParserResult.Type = {
  raw: 'TestInterface',
  kind: {
    value: SyntaxKind.InterfaceDeclaration,
    name: 'InterfaceDeclaration',
  },
};
