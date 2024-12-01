import { Project } from 'ts-morph';

import { BuilderInterfaceTransformer } from './transformer-interface';
import { testInterfaceBasicStructure } from '../__mocks__/test.interface.basic';
import { testInterfaceStructureWithEnum } from '../__mocks__/test.interface.enum';
import { testInterfaceGenericStructure } from '../__mocks__/test.interface.generic';
import { testInterfaceGenericStructureWithConstraintOnly } from '../__mocks__/test.interface.generic.constraint.only';
import { testInterfaceStructureWithGenericParent } from '../__mocks__/test.interface.generic.parent';
import { testInterfaceStructureWithGenericParentOnlyArrays } from '../__mocks__/test.interface.generic.parent.arrays';

const project = new Project();
const modelFile = project.createSourceFile('./foo.ts');
const mockOpts = { project, modelFile, outputPath: './foo.guard.ts' };

describe('BuilderInterfaceTransformer', () => {
  it('constructs correct builder for an interface with basic properties', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(transformer.transform(testInterfaceBasicStructure, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceWithBasicProperties } from "./foo";

      export class TestInterfaceWithBasicPropertiesBuilder implements Partial<TestInterfaceWithBasicProperties> {
          readonly myStringProperty?: string;
          readonly myNumberProperty?: number;
          readonly myBooleanProperty?: boolean;

          withMyStringProperty(value: string): this & Pick<TestInterfaceWithBasicProperties, 'myStringProperty'> {
              return Object.assign(this, { myStringProperty: value })
          }

          withMyNumberProperty(value: number): this & Pick<TestInterfaceWithBasicProperties, 'myNumberProperty'> {
              return Object.assign(this, { myNumberProperty: value })
          }

          withMyBooleanProperty(value: boolean): this & Pick<TestInterfaceWithBasicProperties, 'myBooleanProperty'> {
              return Object.assign(this, { myBooleanProperty: value })
          }

          build(this: TestInterfaceWithBasicProperties): TestInterfaceWithBasicProperties {
              return {
              		myStringProperty: this.myStringProperty,
              		myNumberProperty: this.myNumberProperty,
              		myBooleanProperty: this.myBooleanProperty
              };
          }
      }
      "
    `);
  });

  it('constructs correct builder for an interface with generic properties which have a default and constraint', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(transformer.transform(testInterfaceGenericStructure, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceConstraintExtender } from "../primitives/test.interface.generic.constraint.extender";
      import { TestInterfaceConstraint } from "../primitives/test.interface.generic.constraint";
      import { TestInterfaceWithGenericType } from "./foo";

      export class TestInterfaceWithGenericTypeBuilder<GenericType extends TestInterfaceConstraint = TestInterfaceConstraintExtender> implements Partial<TestInterfaceWithGenericType<GenericType>> {
          readonly myGenericProperty?: GenericType;

          withMyGenericProperty(value: GenericType): this & Pick<TestInterfaceWithGenericType, 'myGenericProperty'> {
              return Object.assign(this, { myGenericProperty: value })
          }

          build(this: TestInterfaceWithGenericType<GenericType>): TestInterfaceWithGenericType<GenericType> {
              return {
              		myGenericProperty: this.myGenericProperty
              };
          }
      }
      "
    `);
  });

  it('constructs correct builder for an interface with generic properties which have a constraint only', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceGenericStructureWithConstraintOnly, mockOpts),
    ).toMatchInlineSnapshot(`
      "import { TestInterfaceConstraint } from "../primitives/test.interface.generic.constraint";
      import { TestInterfaceWithGenericTypeWithConstraintOnly } from "./foo";

      export class TestInterfaceWithGenericTypeWithConstraintOnlyBuilder<GenericType extends TestInterfaceConstraint> implements Partial<TestInterfaceWithGenericTypeWithConstraintOnly<GenericType>> {
          readonly myGenericProperty?: GenericType;

          withMyGenericProperty(value: GenericType): this & Pick<TestInterfaceWithGenericTypeWithConstraintOnly, 'myGenericProperty'> {
              return Object.assign(this, { myGenericProperty: value })
          }

          build(this: TestInterfaceWithGenericTypeWithConstraintOnly<GenericType>): TestInterfaceWithGenericTypeWithConstraintOnly<GenericType> {
              return {
              		myGenericProperty: this.myGenericProperty
              };
          }
      }
      "
    `);
  });

  it('constructs correct builder for an interface with a parent with generic properties', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(transformer.transform(testInterfaceStructureWithGenericParent, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceConstraintExtender } from "../primitives/test.interface.generic.constraint.extender";
      import { TestInterfaceWithParentGeneric } from "./foo";

      export class TestInterfaceWithParentGenericBuilder implements Partial<TestInterfaceWithParentGeneric> {
          readonly mySuperParentProperty?: string;
          readonly myParentProperty?: string;
          readonly myGenericProperty?: TestInterfaceConstraintExtender;
          readonly myGenericPropertySecond?: string;
          readonly myBaseProperty?: string;

          withMySuperParentProperty(value: string): this & Pick<TestInterfaceWithParentGeneric, 'mySuperParentProperty'> {
              return Object.assign(this, { mySuperParentProperty: value })
          }

          withMyParentProperty(value: string): this & Pick<TestInterfaceWithParentGeneric, 'myParentProperty'> {
              return Object.assign(this, { myParentProperty: value })
          }

          withMyGenericProperty(value: TestInterfaceConstraintExtender): this & Pick<TestInterfaceWithParentGeneric, 'myGenericProperty'> {
              return Object.assign(this, { myGenericProperty: value })
          }

          withMyGenericPropertySecond(value: string): this & Pick<TestInterfaceWithParentGeneric, 'myGenericPropertySecond'> {
              return Object.assign(this, { myGenericPropertySecond: value })
          }

          withMyBaseProperty(value: string): this & Pick<TestInterfaceWithParentGeneric, 'myBaseProperty'> {
              return Object.assign(this, { myBaseProperty: value })
          }

          build(this: TestInterfaceWithParentGeneric): TestInterfaceWithParentGeneric {
              return {
              		mySuperParentProperty: this.mySuperParentProperty,
              		myParentProperty: this.myParentProperty,
              		myGenericProperty: this.myGenericProperty,
              		myGenericPropertySecond: this.myGenericPropertySecond,
              		myBaseProperty: this.myBaseProperty
              };
          }
      }
      "
    `);
  });

  it('constructs correct builder for an interface with a parent with generic properties (arrays only)', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceStructureWithGenericParentOnlyArrays, mockOpts),
    ).toMatchInlineSnapshot(`
      "import { TestInterfaceConstraintExtender } from "../primitives/test.interface.generic.constraint.extender";
      import { TestInterfaceWithParentGenericArrayProperties } from "./foo";

      export class TestInterfaceWithParentGenericArrayPropertiesBuilder implements Partial<TestInterfaceWithParentGenericArrayProperties> {
          readonly mySuperParentProperty?: string;
          readonly myParentProperty?: string[];
          readonly myGenericProperty?: TestInterfaceConstraintExtender[];
          readonly myGenericPropertySecond?: string[];
          readonly myBaseProperty?: string;

          withMySuperParentProperty(value: string): this & Pick<TestInterfaceWithParentGenericArrayProperties, 'mySuperParentProperty'> {
              return Object.assign(this, { mySuperParentProperty: value })
          }

          withMyParentProperty(value: string[]): this & Pick<TestInterfaceWithParentGenericArrayProperties, 'myParentProperty'> {
              return Object.assign(this, { myParentProperty: value })
          }

          withMyGenericProperty(value: TestInterfaceConstraintExtender[]): this & Pick<TestInterfaceWithParentGenericArrayProperties, 'myGenericProperty'> {
              return Object.assign(this, { myGenericProperty: value })
          }

          withMyGenericPropertySecond(value: string[]): this & Pick<TestInterfaceWithParentGenericArrayProperties, 'myGenericPropertySecond'> {
              return Object.assign(this, { myGenericPropertySecond: value })
          }

          withMyBaseProperty(value: string): this & Pick<TestInterfaceWithParentGenericArrayProperties, 'myBaseProperty'> {
              return Object.assign(this, { myBaseProperty: value })
          }

          build(this: TestInterfaceWithParentGenericArrayProperties): TestInterfaceWithParentGenericArrayProperties {
              return {
              		mySuperParentProperty: this.mySuperParentProperty,
              		myParentProperty: this.myParentProperty,
              		myGenericProperty: this.myGenericProperty,
              		myGenericPropertySecond: this.myGenericPropertySecond,
              		myBaseProperty: this.myBaseProperty
              };
          }
      }
      "
    `);
  });

  it('constructs correct builder for an interface with an enum property', () => {
    const transformer = new BuilderInterfaceTransformer();
    expect(transformer.transform(testInterfaceStructureWithEnum, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestEnum } from "../../parser/__mocks__/test.enum";
      import { TestInterfaceWithEnumProperty } from "./foo";

      export class TestInterfaceWithEnumPropertyBuilder implements Partial<TestInterfaceWithEnumProperty> {
          readonly myEnumProperty: TestEnum.ENUM_KEY_STRING = TestEnum.ENUM_KEY_STRING;

          build(this: TestInterfaceWithEnumProperty): TestInterfaceWithEnumProperty {
              return {
              		myEnumProperty: TestEnum.ENUM_KEY_STRING
              };
          }
      }
      "
    `);
  });
});
