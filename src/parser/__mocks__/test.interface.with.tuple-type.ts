import { TestEnum } from './test.enum';

/**
 * This is a test interface with a tuple type property.
 */
export interface TestInterfaceWithTupleType {
  /**
   * A tuple type property.
   */
  myTupleTypeProperty: [TestEnum.ENUM_KEY_STRING, TestEnum.ENUM_KEY_NUMBER];
}
