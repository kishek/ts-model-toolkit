import { Project } from 'ts-morph';

import { GuardTypeAliasTransformer } from './transformer-type-alias';
import { testTypeAliasStructure } from '../__mocks__/test.type-alias.structure';

describe('GuardTypeAliasTransformer', () => {
  it('constructs correct type guard for a type alias', () => {
    const transformer = new GuardTypeAliasTransformer();
    const project = new Project();
    const modelFile = project.createSourceFile('./foo.ts');
    expect(
      transformer.transform(testTypeAliasStructure, {
        project,
        modelFile,
        outputPath: './foo.guard.ts',
      }),
    ).toMatchInlineSnapshot(`
      "import { isTestInterface } from "./test.interface.guard";
      import { TestTypeAlias } from "./foo";

      export function isTestTypeAlias(entity: any): entity is TestTypeAlias {
          if (entity && (typeof entity === "string" || typeof entity === "number" || typeof entity === "boolean" || isTestInterface(entity)))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });
});
