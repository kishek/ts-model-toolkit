import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser/types';

// NOTE: taken from parse-declaration-interface.test.ts.snap
export const testInterfaceStructureWithGenericParentOnlyArrays: ParserResult.Structure = {
  name: 'TestInterfaceWithParentGenericArrayProperties',
  type: ParserResult.StructureType.INTERFACE,
  comment:
    'This is a test interface with a parent interface which accepts type arguments and only has array properties.',
  imports: [
    {
      name: 'TestInterfaceConstraintExtender',
      path: './primitives/test.interface.generic.constraint.extender',
    },
    {
      name: 'TestInterfaceParentWithArrayProperties',
      path: './primitives/test.interface.parent.arrays',
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
      name: 'TestInterfaceParentWithArrayProperties',
      type: ParserResult.StructureType.INTERFACE,
      comment:
        'This is a test interface which acts as a parent interface and only has array properties.',
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
            raw: 'string[]',
            kind: {
              value: SyntaxKind.ArrayType,
              name: 'ArrayType',
            },
            elements: [
              {
                raw: 'string',
                kind: {
                  value: SyntaxKind.StringKeyword,
                  name: 'StringKeyword',
                },
              },
            ],
          },
        },
        {
          name: 'myGenericProperty',
          comment: 'A generic property.',
          imports: [],
          isRequired: true,
          type: {
            raw: 'GenericParentType[]',
            kind: {
              value: SyntaxKind.ArrayType,
              name: 'ArrayType',
            },
            elements: [
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
            ],
          },
        },
        {
          name: 'myGenericPropertySecond',
          comment: 'A second generic property.',
          imports: [],
          isRequired: true,
          type: {
            raw: 'GenericParentTypeSecond[]',
            kind: {
              value: SyntaxKind.ArrayType,
              name: 'ArrayType',
            },
            elements: [
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
      name: 'TestInterfaceParentWithArrayProperties',
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
