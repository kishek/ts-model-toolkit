import { Project, SourceFile } from 'ts-morph';

import { DeclarationParser } from '.';

const mockParseEnum = jest.fn();
jest.mock('./parser-declaration-enum', () => ({
  EnumParser: class EnumParserMock {
    parse(...args: any) {
      return mockParseEnum(...args);
    }
  },
}));
const mockParseInterface = jest.fn();
jest.mock('./parser-declaration-interface', () => ({
  InterfaceParser: class InterfaceParserMock {
    parse(...args: any) {
      return mockParseInterface(...args);
    }
  },
}));
const mockParseTypeAlias = jest.fn();
jest.mock('./parser-declaration-type-alias', () => ({
  TypeAliasParser: class TypeAliasParserMock {
    parse(...args: any) {
      return mockParseTypeAlias(...args);
    }
  },
}));

interface DeclarationTestCase {
  method: 'addEnum' | 'addInterface' | 'addTypeAlias';
  type: 'Enum' | 'Interface' | 'TypeAlias';
  mock: jest.Mock;
}
const declarationTestCases: DeclarationTestCase[] = [
  { method: 'addEnum', type: 'Enum', mock: mockParseEnum },
  { method: 'addInterface', type: 'Interface', mock: mockParseInterface },
  { method: 'addTypeAlias', type: 'TypeAlias', mock: mockParseTypeAlias },
];

describe('Parser', () => {
  let file: SourceFile;
  let parser: DeclarationParser;

  beforeEach(() => {
    mockParseEnum.mockReturnValue(`mockParseEnum return value`);
    mockParseInterface.mockReturnValue(`mockParseInterface return value`);
    mockParseTypeAlias.mockReturnValue(`mockParseTypeAlias return value`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parse()', () => {
    declarationTestCases.forEach(({ method, type, mock }) => {
      it(`attempts to extract ${type.toLowerCase()} structure for ${type.toLowerCase()} declaration`, () => {
        file = new Project().createSourceFile(`parser.parse.test.ts`);
        // Add a legitimate export for an interface first to the file.
        const declaration = file[method]({
          name: `Test${type}`,
          isExported: true,
          type: 'FooType',
        });
        parser = new DeclarationParser();

        const result = parser.parse(file);

        expect(result).toBe(`mockParse${type} return value`);
        expect(mock).toBeCalled();
        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(declaration);
      });
    });
  });

  describe('parseAll()', () => {
    it('attempts to transform file with multiple interfaces', () => {
      file = new Project().createSourceFile(`parser.parseAll.test.ts`);

      const declarationOne = file.addInterface({
        name: `TestInterfaceOne`,
        isExported: true,
      });
      const declarationTwo = file.addInterface({
        name: `TestInterfaceTwo`,
        isExported: true,
      });

      const parser = new DeclarationParser();
      const result = parser.parseAll(file);

      expect(result).toEqual([
        `mockParseInterface return value`,
        `mockParseInterface return value`,
      ]);
      expect(mockParseInterface).toBeCalled();
      expect(mockParseInterface).toBeCalledTimes(2);
      expect(mockParseInterface).nthCalledWith(1, declarationOne);
      expect(mockParseInterface).nthCalledWith(2, declarationTwo);
    });
  });
});
