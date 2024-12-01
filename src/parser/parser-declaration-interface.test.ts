import { getProject } from './__test_utils__/util';
import { InterfaceParser } from './parser-declaration-interface';

interface TestCase {
  description: string;
  name: string;
  path: string;
}

const cases: TestCase[] = [
  {
    description: 'with no properties',
    name: 'TestInterfaceEmpty',
    path: 'test.interface.empty.ts',
  },
  {
    description: 'with basic properties - boolean, string, number',
    name: 'TestInterfaceWithBasicProperties',
    path: 'test.interface.with.basic.properties.ts',
  },
  {
    description: 'with special properties - date',
    name: 'TestInterfaceWithSpecialProperties',
    path: 'test.interface.with.special.properties.ts',
  },
  {
    description: 'with enum property',
    name: 'TestInterfaceWithEnumProperty',
    path: 'test.interface.with.enum.ts',
  },
  {
    description: 'with an array property',
    name: 'TestInterfaceWithArrayProperty',
    path: 'test.interface.with.array.ts',
  },
  {
    description: 'with a narrowed enum property',
    name: 'TestInterfaceWithEnumNarrowProperty',
    path: 'test.interface.with.enum.narrow.ts',
  },
  {
    description: 'with a type alias property',
    name: 'TestInterfaceWithTypeAlias',
    path: 'test.interface.with.type-alias.ts',
  },
  {
    description: 'with properties which accept type arguments',
    name: 'TestInterfaceWithGenericProperty',
    path: 'test.interface.with.interface-generic.ts',
  },
  {
    description: 'with a union type property',
    name: 'TestInterfaceWithUnionType',
    path: 'test.interface.with.union-type.ts',
  },
  {
    description: 'with a tuple type property',
    name: 'TestInterfaceWithTupleType',
    path: 'test.interface.with.tuple-type.ts',
  },
  {
    description: 'with a rest type property',
    name: 'TestInterfaceWithRestType',
    path: 'test.interface.with.rest-type.ts',
  },
  {
    description: 'with an indexed type property',
    name: 'TestInterfaceWithIndexedAccessType',
    path: 'test.interface.with.indexed.access.ts',
  },
  {
    description: 'with a generic property, constrained by type parameters',
    name: 'TestInterfaceWithGenericType',
    path: 'test.interface.with.generic-type.ts',
  },
  {
    description: 'with a generic array property, constrained by type parameters',
    name: 'TestInterfaceWithGenericArrayType',
    path: 'test.interface.with.array.generic.ts',
  },
  {
    description: 'with a parent interface',
    name: 'TestInterfaceWithParent',
    path: 'test.interface.with.parent-interface.ts',
  },
  {
    description: 'with a parent interface which accepts type arguments',
    name: 'TestInterfaceWithParentGeneric',
    path: 'test.interface.with.parent-interface-generic.ts',
  },
  {
    description:
      'with a parent interface which accepts type arguments and only has array properties',
    name: 'TestInterfaceWithParentGenericArrayProperties',
    path: 'test.interface.with.parent-interface-generic.arrays.ts',
  },
  {
    description: 'with a relationship type (property which accepts type arguments)',
    name: 'TestInterfaceWithRelationshipProperty',
    path: 'test.interface.with.relationship.ts',
  },
];

const project = getProject();

describe('InterfaceParser', () => {
  expect.addSnapshotSerializer({
    test: () => true,
    serialize: (val) => JSON.stringify(val, null, 2),
  });

  cases.forEach(({ description, name, path }) => {
    it(`returns structure of interface ${description}`, () => {
      const parser = new InterfaceParser();
      const testFile = project.getSourceFileOrThrow(path);
      const interfaceDeclaration = testFile.getInterfaceOrThrow(name);
      expect(parser.parse(interfaceDeclaration)).toMatchSnapshot();
    });
  });
});
