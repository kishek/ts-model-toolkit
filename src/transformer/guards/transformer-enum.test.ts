import { Project } from 'ts-morph';

import { GuardEnumTransformer } from './transformer-enum';
import { testEnumStructure } from '../__mocks__/test.enum.structure';

describe('GuardEnumTransformer', () => {
  it('constructs correct type guard for an enum', () => {
    const transformer = new GuardEnumTransformer();
    const project = new Project();
    const modelFile = project.createSourceFile('./foo.ts');
    expect(
      transformer.transform(testEnumStructure, {
        project,
        modelFile,
        outputPath: './foo.guard.ts',
      }),
    ).toMatchInlineSnapshot(`
      "import { TestEnum } from "./foo";

      export function isTestEnum(entity: any): entity is TestEnum {
          if (entity && (entity === TestEnum.ENUM_KEY_STRING || entity === TestEnum.ENUM_KEY_NUMBER))
          {
              return true;
          }
          return false;
      }
      "
    `);
  });
});
