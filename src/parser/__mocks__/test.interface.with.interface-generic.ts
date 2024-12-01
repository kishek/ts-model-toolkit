import { TestInterfaceParentBasic } from './primitives/test.interface.parent.basic';
import { TestEnum } from './test.enum';

/**
 * This is a test interface with an interface which accepts a type argument.
 */
export interface TestInterfaceWithGenericProperty {
  /**
   * A generic property with a primitive.
   */
  myGenericProperty: TestInterfaceParentBasic<boolean>;
  /**
   * A generic property with another type reference.
   */
  myGenericPropertyWithTypeReference: TestInterfaceParentBasic<TestEnum>;
}
