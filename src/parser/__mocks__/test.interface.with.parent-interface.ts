import { TestInterfaceConstraint } from './primitives/test.interface.generic.constraint';

/**
 * This is a test interface with a parent interface.
 */
export interface TestInterfaceWithParent extends TestInterfaceConstraint {
  /**
   * A base property.
   */
  myBaseProperty: string;
}
