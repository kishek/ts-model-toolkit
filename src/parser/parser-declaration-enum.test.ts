import { SourceFile } from 'ts-morph';

import { getProject } from './__test_utils__/util';
import { EnumParser } from './parser-declaration-enum';

const project = getProject();

describe('EnumParser', () => {
  let file: SourceFile;
  let parser: EnumParser;

  beforeAll(() => {
    file = project.getSourceFileOrThrow('test.enum.ts');
    expect.addSnapshotSerializer({
      test: () => true,
      serialize: (val) => JSON.stringify(val, null, 2),
    });
  });

  it('returns structure of an empty enum', () => {
    parser = new EnumParser();
    const emptyEnumFile = project.getSourceFileOrThrow('test.enum.empty.ts');
    const enumDeclaration = emptyEnumFile.getEnumOrThrow('TestEnumEmpty');
    expect(parser.parse(enumDeclaration)).toMatchInlineSnapshot(`
      {
        "name": "TestEnumEmpty",
        "type": "enum",
        "comment": "This is a test enum with no members.",
        "extendingStructures": [],
        "imports": [],
        "properties": [],
        "path": "/test-root/src/parser/__mocks__/test.enum.empty.ts"
      }
    `);
  });

  it('returns structure of enum', () => {
    parser = new EnumParser();
    const enumDeclaration = file.getEnumOrThrow('TestEnum');
    expect(parser.parse(enumDeclaration)).toMatchInlineSnapshot(`
      {
        "name": "TestEnum",
        "type": "enum",
        "comment": "This is a test enum.",
        "extendingStructures": [],
        "imports": [],
        "properties": [
          {
            "name": "ENUM_KEY_STRING",
            "comment": "A test enum key/value pair.",
            "type": {
              "raw": "enum-member",
              "kind": {
                "value": 306,
                "name": "EnumMember"
              },
              "defaultValue": {
                "raw": "'enumValue'",
                "kind": {
                  "value": 154,
                  "name": "StringKeyword"
                }
              }
            },
            "imports": [],
            "isRequired": false
          },
          {
            "name": "ENUM_KEY_NUMBER",
            "comment": "Another test enum key/value pair",
            "type": {
              "raw": "enum-member",
              "kind": {
                "value": 306,
                "name": "EnumMember"
              },
              "defaultValue": {
                "raw": "5",
                "kind": {
                  "value": 150,
                  "name": "NumberKeyword"
                }
              }
            },
            "imports": [],
            "isRequired": false
          }
        ],
        "path": "/test-root/src/parser/__mocks__/test.enum.ts"
      }
      `);
  });
});
