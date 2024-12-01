import { TestEnum } from './test.enum';

/**
 * This is a test interface with an enum property with a specific value.
 */
export interface TestInterfaceWithEnumNarrowProperty {
  /**
   * A enum property with a specific value.
   */
  myEnumProperty: TestEnum.ENUM_KEY_STRING;
}
