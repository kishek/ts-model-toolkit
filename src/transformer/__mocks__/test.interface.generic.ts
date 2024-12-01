import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceGenericStructure: ParserResult.Structure = {
  name: 'TestInterfaceWithGenericType',
  type: ParserResult.StructureType.INTERFACE,
  isBaseStructure: true,
  comment: 'This is a test interface with a generic type property.',
  imports: [
    {
      name: 'TestInterfaceConstraint',
      path: './primitives/test.interface.generic.constraint',
    },
    {
      name: 'TestInterfaceConstraintExtender',
      path: './primitives/test.interface.generic.constraint.extender',
    },
  ],
  properties: [
    {
      name: 'myGenericProperty',
      comment: 'A generic property.',
      imports: [],
      isRequired: true,
      type: {
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
      },
    },
  ],
  extendingStructures: [],
  typeParameters: [
    {
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
    },
  ],
  typeArguments: [],
  path: path.resolve('./foo.ts'),
};
