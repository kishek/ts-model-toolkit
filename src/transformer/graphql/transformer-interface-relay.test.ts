import { GraphQLInterfaceRelayTransformer } from './transformer-interface-relay';
import { testInterfaceRelationshipStructure } from '../__mocks__/test.interface.relationship';

describe('GraphQLInterfaceRelayTransformer', () => {
  it('constructs correct GQL representation for an interface with a relationship type (marked as such by opts)', () => {
    const transformer = new GraphQLInterfaceRelayTransformer();
    expect(
      transformer.transform(testInterfaceRelationshipStructure, {
        useRelayConnectionSpecification: { qualifiers: ['TestRelationship'] },
      }),
    ).toMatchInlineSnapshot(`
      "
            "This is a test interface with an relationship property."
            type TestParentOfRelationship {
              
            "A relationship property."
            myRelatedEntitiesConnection(
              first: Int,
              after: String,
              last: Int,
              before: String
            ): TestParentOfRelationshipMyRelatedEntitiesConnection
          
            }
            
            "Page info for connection between TestParentOfRelationship and myRelatedEntities"
            type TestParentOfRelationshipMyRelatedEntitiesPageInfo {
              hasNextPage: Boolean!
              hasPreviousPage: Boolean!
            }
          

            "Connection between TestParentOfRelationship and myRelatedEntities"
            type TestParentOfRelationshipMyRelatedEntitiesConnection {
              pageInfo: TestParentOfRelationshipMyRelatedEntitiesPageInfo!
              edges: [TestParentOfRelationshipMyRelatedEntitiesEdge]
            }
          

            "Edge between TestParentOfRelationship and myRelatedEntities"
            type TestParentOfRelationshipMyRelatedEntitiesEdge {
              cursor: String!
              node: TestNode
            }
          
          "
    `);
  });
});
