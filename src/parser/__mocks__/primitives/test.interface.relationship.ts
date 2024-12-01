import { TestNode } from './test.interface.node';

/**
 * This is a test relationship interface.
 */
export interface TestRelationship<Entity extends TestNode = TestNode> {
  /**
   * This is a test entity.
   */
  entity: Entity;
}
