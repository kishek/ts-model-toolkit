import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

export const testTypeReferenceGenericWithDefaultAndConstraintType: ParserResult.Type = {
  raw: 'GenericType',
  kind: {
    value: SyntaxKind.TypeReference,
    name: 'TypeReference',
  },
  defaultValue: {
    raw: 'TestInterfaceConstraintExtender',
    kind: {
      value: SyntaxKind.TypeReference,
      name: 'TypeReference',
    },
  },
  constraintValue: {
    raw: 'TestInterfaceConstraint',
    kind: {
      value: SyntaxKind.TypeReference,
      name: 'TypeReference',
    },
  },
};
