import { SourceFile } from 'ts-morph';

import { getProject } from './__test_utils__/util';
import { TypeAliasParser } from './parser-declaration-type-alias';

const project = getProject();

describe('TypeAliasParser', () => {
  let file: SourceFile;
  let parser: TypeAliasParser;

  beforeAll(() => {
    file = project.getSourceFileOrThrow('test.type-alias.ts');
    expect.addSnapshotSerializer({
      test: () => true,
      serialize: (val) => JSON.stringify(val, null, 2),
    });
  });

  it('returns structure of type alias', () => {
    parser = new TypeAliasParser();
    const typeAliasDeclaration = file.getTypeAliasOrThrow('TestTypeAlias');
    expect(parser.parse(typeAliasDeclaration)).toMatchInlineSnapshot(`
      {
        "type": "typeAlias",
        "typeAliases": [
          {
            "raw": "literal",
            "kind": {
              "value": 154,
              "name": "StringKeyword"
            }
          },
          {
            "raw": "literal",
            "kind": {
              "value": 150,
              "name": "NumberKeyword"
            }
          },
          {
            "raw": "literal",
            "kind": {
              "value": 136,
              "name": "BooleanKeyword"
            }
          },
          {
            "raw": "TestInterface",
            "kind": {
              "value": 264,
              "name": "InterfaceDeclaration"
            }
          }
        ],
        "name": "TestTypeAlias",
        "comment": "This is a test type alias.",
        "imports": [
          {
            "name": "TestInterface",
            "path": "./test.interface"
          }
        ],
        "extendingStructures": [],
        "properties": [],
        "path": "/test-root/src/parser/__mocks__/test.type-alias.ts"
      }
      `);
  });
});
