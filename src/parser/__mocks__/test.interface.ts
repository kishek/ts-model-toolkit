import { TestInterfaceConstraint } from './primitives/test.interface.generic.constraint';
import { TestInterfaceConstraintExtender } from './primitives/test.interface.generic.constraint.extender';
import { TestInterfaceParent } from './primitives/test.interface.parent';
import { TestInterfaceParentBasic } from './primitives/test.interface.parent.basic';
import { TestEnum } from './test.enum';
import { TestTypeAliasWithoutInterface } from './test.type-alias.no-interface';

/**
 * This is a test interface.
 */
export interface TestInterface<
  GenericType extends TestInterfaceConstraint = TestInterfaceConstraint,
> extends TestInterfaceParent<TestInterfaceConstraintExtender, string> {
  /**
   * A string property.
   */
  myStringProperty: string;
  /**
   * A number property.
   */
  myNumberProperty: number;
  /**
   * A boolean property.
   */
  myBooleanProperty: boolean;
  /**
   * A union property.
   */
  myUnionProperty: string | number | boolean;
  /**
   * A enum property.
   */
  myEnumProperty: TestEnum;
  /**
   * A enum property with a specific value.
   */
  myEnumNarrowProperty: TestEnum.ENUM_KEY_STRING;
  /**
   * A enum property with a required value, and other accepted values.
   */
  myEnumArrayProperty: [TestEnum.ENUM_KEY_STRING, ...TestEnum[]];
  /**
   * A type alias property.
   */
  myTypeAliasProperty: TestTypeAliasWithoutInterface;
  /**
   * An array of type aliases.
   */
  myTypeAliasPropertyArray: TestTypeAliasWithoutInterface[];
  /**
   * A property which accepts a generic.
   */
  myBasicPropertyBoolean: TestInterfaceParentBasic<boolean>;
  /**
   * A property which accepts a generic.
   */
  myBasicPropertyEnum: TestInterfaceParentBasic<TestEnum>;
  /**
   * A generic property which is defined in this interface using the above constraints.
   */
  myGenericPropertyScoped: GenericType;
  /**
   * A generic property which is defined in this interface using the above constraints.
   */
  myGenericPropertyScopedArray: GenericType[];
}
