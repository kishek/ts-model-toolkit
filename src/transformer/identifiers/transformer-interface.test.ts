import { Project } from 'ts-morph';

import { IdentifierInterfaceTransformer } from './transformer-interface';
import { testInterfaceStructureWithGenericParent } from '../__mocks__/test.interface.generic.parent';

const project = new Project();
const modelFile = project.createSourceFile('./foo.ts');
const mockOpts = { project, modelFile, outputPath: './foo.guard.ts' };

const imports = {
  base: {
    name: 'BaseIdentifier',
    path: '../__mocks__/test.transformer.base.identifier.ts',
  },
  parser: {
    name: 'Parser',
    path: '../__mocks__/test.transformer.base.parser.ts',
  },
};

describe(IdentifierInterfaceTransformer, () => {
  it('constructs correct identifier class for an interface with basic properties', () => {
    const transformer = new IdentifierInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceStructureWithGenericParent, {
        ...mockOpts,
        mustExtendStructureOfName: 'TestInterfaceParent',
        imports,
      }),
    ).toMatchInlineSnapshot(`
      "import { BaseIdentifier, Parser } from "../__mocks__/test.transformer.base.identifier.ts";

      export class TestInterfaceWithParentGenericIdentifier extends BaseIdentifier<'testInterfaceWithParentGeneric'> {
          public static create(id: string): TestInterfaceWithParentGenericIdentifier {

              const uuid = id;
              return new TestInterfaceWithParentGenericIdentifier('testInterfaceWithParentGeneric', uuid);

          }

          public static parse(id: string): TestInterfaceWithParentGenericIdentifier {

              const uuid = Parser.id(id);
              return new TestInterfaceWithParentGenericIdentifier('testInterfaceWithParentGeneric', uuid);

          }
      }
      "
    `);
  });

  it('constructs empty class for identifier which does not uphold extends constraint', () => {
    const transformer = new IdentifierInterfaceTransformer();
    expect(
      transformer.transform(testInterfaceStructureWithGenericParent, {
        ...mockOpts,
        mustExtendStructureOfName: 'TestInterfaceParentFoo',
        imports,
      }),
    ).toMatchInlineSnapshot(`""`);
  });
});
