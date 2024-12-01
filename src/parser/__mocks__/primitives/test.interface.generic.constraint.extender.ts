import { TestInterfaceConstraint } from './test.interface.generic.constraint';

/**
 * This is a test interface used to establish a generic type constraint.
 */
export interface TestInterfaceConstraintExtender extends TestInterfaceConstraint {
  /**
   * A random property.
   */
  myRandomExtendingProperty: string;
}
