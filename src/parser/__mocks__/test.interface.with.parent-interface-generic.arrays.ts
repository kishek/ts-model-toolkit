import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';
import { TestInterfaceParentWithArrayProperties } from './primitives/test.interface.parent.arrays';

/**
 * This is a test interface with a parent interface which accepts type arguments and only has array properties.
 */
export interface TestInterfaceWithParentGenericArrayProperties
  extends TestInterfaceParentWithArrayProperties<
    TestInterfaceConstraintExtender,
    string
  > {
  /**
   * A base property.
   */
  myBaseProperty: string;
}
