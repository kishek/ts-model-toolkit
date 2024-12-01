import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceStructureWithGenericParent: ParserResult.Structure = {
  name: 'TestInterfaceWithParentGeneric',
  type: ParserResult.StructureType.INTERFACE,
  comment:
    'This is a test interface with a parent interface which accepts type arguments.',
  imports: [
    {
      name: 'TestInterfaceConstraintExtender',
      path: './primitives/test.interface.generic.constraint.extender',
    },
    {
      name: 'TestInterfaceParent',
      path: './primitives/test.interface.parent',
    },
  ],
  properties: [
    {
      name: 'myBaseProperty',
      comment: 'A base property.',
      imports: [],
      isRequired: true,
      type: {
        raw: 'string',
        kind: {
          value: SyntaxKind.StringKeyword,
          name: 'StringKeyword',
        },
      },
    },
  ],
  extendingStructures: [
    {
      name: 'TestInterfaceParent',
      type: ParserResult.StructureType.INTERFACE,
      comment: 'This is a test interface which acts as a parent interface.',
      imports: [
        {
          name: 'TestInterfaceConstraint',
          path: './test.interface.generic.constraint',
        },
        {
          name: 'TestInterfaceSuperParent',
          path: './test.interface.parent.super',
        },
      ],
      properties: [
        {
          name: 'myParentProperty',
          comment: 'A string property.',
          imports: [],
          isRequired: true,
          type: {
            raw: 'string',
            kind: {
              value: SyntaxKind.StringKeyword,
              name: 'StringKeyword',
            },
          },
        },
        {
          name: 'myGenericProperty',
          comment: 'A generic property.',
          imports: [],
          isRequired: true,
          type: {
            raw: 'GenericParentType',
            kind: {
              value: SyntaxKind.TypeReference,
              name: 'TypeReference',
            },
            defaultValue: {
              raw: 'TestInterfaceConstraint',
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
            suppliedValue: {
              raw: 'TestInterfaceConstraintExtender',
              kind: {
                value: SyntaxKind.TypeReference,
                name: 'TypeReference',
              },
            },
          },
        },
        {
          name: 'myGenericPropertySecond',
          comment: 'A second generic property.',
          imports: [],
          isRequired: true,
          type: {
            raw: 'GenericParentTypeSecond',
            kind: {
              value: SyntaxKind.NumberKeyword,
              name: 'NumberKeyword',
            },
            defaultValue: {
              raw: 'number',
              kind: {
                value: SyntaxKind.NumberKeyword,
                name: 'NumberKeyword',
              },
            },
            suppliedValue: {
              raw: 'string',
              kind: {
                value: SyntaxKind.StringKeyword,
                name: 'StringKeyword',
              },
            },
          },
        },
      ],
      extendingStructures: [
        {
          name: 'TestInterfaceSuperParent',
          type: ParserResult.StructureType.INTERFACE,
          comment:
            'This is a test interface which acts as a super parent (parent of parent) interface.',
          imports: [],
          properties: [
            {
              name: 'mySuperParentProperty',
              comment: 'A string property.',
              imports: [],
              isRequired: true,
              type: {
                raw: 'string',
                kind: {
                  value: SyntaxKind.StringKeyword,
                  name: 'StringKeyword',
                },
              },
            },
          ],
          extendingStructures: [],
          typeParameters: [],
          typeArguments: [],
          path: path.resolve('./foo.ts'),
        },
      ],
      typeParameters: [
        {
          raw: 'GenericParentType',
          kind: {
            value: SyntaxKind.TypeReference,
            name: 'TypeReference',
          },
          defaultValue: {
            raw: 'TestInterfaceConstraint',
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
          suppliedValue: {
            raw: 'TestInterfaceConstraintExtender',
            kind: {
              value: SyntaxKind.TypeReference,
              name: 'TypeReference',
            },
          },
        },
        {
          raw: 'GenericParentTypeSecond',
          kind: {
            value: SyntaxKind.NumberKeyword,
            name: 'NumberKeyword',
          },
          defaultValue: {
            raw: 'number',
            kind: {
              value: SyntaxKind.NumberKeyword,
              name: 'NumberKeyword',
            },
          },
          suppliedValue: {
            raw: 'string',
            kind: {
              value: SyntaxKind.StringKeyword,
              name: 'StringKeyword',
            },
          },
        },
      ],
      typeArguments: [],
      path: path.resolve('./foo.ts'),
    },
  ],
  typeParameters: [],
  typeArguments: [
    {
      name: 'TestInterfaceParent',
      typeArguments: [
        {
          raw: 'TestInterfaceConstraintExtender',
          kind: {
            value: SyntaxKind.TypeReference,
            name: 'TypeReference',
          },
        },
        {
          raw: 'string',
          kind: {
            value: SyntaxKind.StringKeyword,
            name: 'StringKeyword',
          },
        },
      ],
    },
  ],
  path: path.resolve('./foo.ts'),
};
