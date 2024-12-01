import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';
import { TestInterfaceParent } from './primitives/test.interface.parent';

/**
 * This is a test interface with a parent interface which accepts type arguments.
 */
export interface TestInterfaceWithParentGeneric
  extends TestInterfaceParent<TestInterfaceConstraintExtender, string> {
  /**
   * A base property.
   */
  myBaseProperty: string;
}
