import { Project } from 'ts-morph';

import { GuardInterfaceTransformer } from './transformer-interface';
import { testInterfaceBasicStructure } from '../__mocks__/test.interface.basic';
import { testInterfaceBasicWithOptionalPropertiesStructure } from '../__mocks__/test.interface.basic.with.optional.properties';
import { testInterfaceGenericStructure } from '../__mocks__/test.interface.generic';
import { testInterfaceGenericStructureWithConstraintOnly } from '../__mocks__/test.interface.generic.constraint.only';
import { testInterfaceStructureWithGenericParent } from '../__mocks__/test.interface.generic.parent';
import { testInterfaceSpecialStructure } from '../__mocks__/test.interface.special';

const project = new Project();
const modelFile = project.createSourceFile('./foo.ts');
const mockOpts = { project: project, modelFile, outputPath: './foo.guard.ts' };

describe('GuardInterfaceTransformer', () => {
  it('constructs correct type guard for an interface with basic properties', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(transformer.transform(testInterfaceBasicStructure, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceWithBasicProperties } from "./foo";

      export function isTestInterfaceWithBasicProperties(entity: any): entity is TestInterfaceWithBasicProperties {
          if (entity && (typeof entity.myStringProperty === "string" && typeof entity.myNumberProperty === "number" && typeof entity.myBooleanProperty === "boolean"))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });

  it('constructs correct type guard for an interface with optional properties', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceBasicWithOptionalPropertiesStructure, mockOpts),
    ).toMatchInlineSnapshot(`
      "import { TestInterfaceWithBasicProperties } from "./foo";

      export function isTestInterfaceWithBasicProperties(entity: any): entity is TestInterfaceWithBasicProperties {
          if (entity && (typeof entity.myStringProperty === "string" && (!entity.myNumberProperty || (typeof entity.myNumberProperty === "number")) && (!entity.myBooleanProperty || (typeof entity.myBooleanProperty === "boolean"))))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });

  it('constructs correct type guard for an interface with special properties', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(transformer.transform(testInterfaceSpecialStructure, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceWithSpecialProperties } from "./foo";

      export function isTestInterfaceWithSpecialProperties(entity: any): entity is TestInterfaceWithSpecialProperties {
          if (entity && (entity.myDateProperty.constructor.name === "Date"))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });

  it('constructs correct type guard for an interface with generic properties which have a default and constraint', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(transformer.transform(testInterfaceGenericStructure, mockOpts))
      .toMatchInlineSnapshot(`
      "import { TestInterfaceConstraintExtender } from "./primitives/test.interface.generic.constraint.extender";
      import { TestInterfaceConstraint } from "./primitives/test.interface.generic.constraint";
      import { isTestInterfaceConstraintExtender } from "./primitives/test.interface.generic.constraint.extender.guard";
      import { TestInterfaceWithGenericType } from "./foo";

      export function isTestInterfaceWithGenericType<GenericType extends TestInterfaceConstraint = TestInterfaceConstraintExtender>(entity: any, // eslint-disable-next-line @typescript-eslint/no-unused-vars
          isGenericType?: (entity: any) => entity is GenericType): entity is TestInterfaceWithGenericType<GenericType> {
          if (entity && ((isGenericType || isTestInterfaceConstraintExtender)(entity.myGenericProperty)))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });

  it('constructs correct type guard for an interface with generic properties which have a constraint only', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceGenericStructureWithConstraintOnly, mockOpts),
    ).toMatchInlineSnapshot(`
      "import { TestInterfaceConstraint } from "./primitives/test.interface.generic.constraint";
      import { isTestInterfaceConstraint } from "./primitives/test.interface.generic.constraint.guard";
      import { TestInterfaceWithGenericTypeWithConstraintOnly } from "./foo";

      export function isTestInterfaceWithGenericTypeWithConstraintOnly<GenericType extends TestInterfaceConstraint>(entity: any, // eslint-disable-next-line @typescript-eslint/no-unused-vars
          isGenericType?: (entity: any) => entity is GenericType): entity is TestInterfaceWithGenericTypeWithConstraintOnly<GenericType> {
          if (entity && ((isGenericType || isTestInterfaceConstraint)(entity.myGenericProperty)))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });

  it('constructs correct type guard for an interface with a parent with generic properties', () => {
    const transformer = new GuardInterfaceTransformer();
    expect(transformer.transform(testInterfaceStructureWithGenericParent, mockOpts))
      .toMatchInlineSnapshot(`
      "import { isTestInterfaceParent } from "./primitives/test.interface.parent.guard";
      import { TestInterfaceWithParentGeneric } from "./foo";

      export function isTestInterfaceWithParentGeneric(entity: any): entity is TestInterfaceWithParentGeneric {
          if (entity && (typeof entity.myBaseProperty === "string" && isTestInterfaceParent(entity)))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });
});
