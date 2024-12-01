import { TestNode } from './primitives/test.interface.node';
import { TestRelationship } from './primitives/test.interface.relationship';

/**
 * This is a test interface with an relationship property.
 */
export interface TestInterfaceWithRelationshipProperty {
  /**
   * A relationship property.
   */
  myRelationshipProperty: TestRelationship<TestNode>;
}
