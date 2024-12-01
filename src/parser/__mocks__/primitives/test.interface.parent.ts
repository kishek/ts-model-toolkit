import { TestInterfaceConstraint } from './test.interface.generic.constraint';
import { TestInterfaceSuperParent } from './test.interface.parent.super';

/**
 * This is a test interface which acts as a parent interface.
 */
export interface TestInterfaceParent<
  GenericParentType extends TestInterfaceConstraint = TestInterfaceConstraint,
  GenericParentTypeSecond = number,
> extends TestInterfaceSuperParent {
  /**
   * A string property.
   */
  myParentProperty: string;
  /**
   * A generic property.
   */
  myGenericProperty: GenericParentType;
  /**
   * A second generic property.
   */
  myGenericPropertySecond: GenericParentTypeSecond;
}
