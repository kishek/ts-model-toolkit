import { TestInterfaceConstraint } from './primitives/test.interface.generic.constraint';
import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';

/**
 * This is a test interface with a generic array property.
 */
export interface TestInterfaceWithIndexedAccessType<
  GenericType extends TestInterfaceConstraint = TestInterfaceConstraintExtender,
> {
  /**
   * An indexed property.
   */
  myIndexedProperty: GenericType['myRandomProperty'];
}
