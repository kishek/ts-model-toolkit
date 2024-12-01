import { TestInterfaceConstraint } from './primitives/test.interface.generic.constraint';
import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';

/**
 * This is a test interface with a generic array property.
 */
export interface TestInterfaceWithGenericArrayType<
  GenericType extends TestInterfaceConstraint = TestInterfaceConstraintExtender,
> {
  /**
   * A generic array property.
   */
  myGenericArrayProperty: GenericType[];
}
