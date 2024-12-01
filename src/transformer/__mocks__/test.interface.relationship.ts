import path from 'path';

import { SyntaxKind } from 'ts-morph';

import { ParserResult } from '../../parser';

export const testInterfaceRelationshipStructure: ParserResult.Structure = {
  name: 'TestParentOfRelationship',
  type: ParserResult.StructureType.INTERFACE,
  comment: 'This is a test interface with an relationship property.',
  imports: [
    {
      name: 'TestNode',
      path: './primitives/test.interface.node',
    },
    {
      name: 'TestRelationship',
      path: './primitives/test.interface.relationship',
    },
  ],
  properties: [
    {
      name: 'myRelatedEntities',
      comment: 'A relationship property.',
      imports: [
        {
          name: 'TestRelationship',
          path: './primitives/test.interface.relationship',
        },
      ],
      isRequired: true,
      type: {
        raw: 'TestRelationship',
        kind: {
          value: SyntaxKind.TypeReference,
          name: 'TypeReference',
        },
        typeArguments: [
          {
            raw: 'TestNode',
            kind: {
              value: SyntaxKind.TypeReference,
              name: 'TypeReference',
            },
          },
        ],
      },
    },
  ],
  extendingStructures: [],
  typeParameters: [],
  typeArguments: [],
  path: path.resolve(__dirname, '.'),
};
