import { TestInterfaceConstraint } from './primitives/test.interface.generic.constraint';
import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';

/**
 * This is a test interface with a generic type property.
 */
export interface TestInterfaceWithGenericType<
  GenericType extends TestInterfaceConstraint = TestInterfaceConstraintExtender,
> {
  /**
   * A generic property.
   */
  myGenericProperty: GenericType;
}
