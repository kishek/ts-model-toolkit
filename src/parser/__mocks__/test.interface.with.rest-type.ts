import { TestEnum } from './test.enum';

/**
 * This is a test interface with a rest type property.
 */
export interface TestInterfaceWithRestType {
  /**
   * A tuple type property which contains a rest type.
   */
  myTupleTypePropertyWithRestType: [TestEnum.ENUM_KEY_STRING, ...TestEnum[]];
}
