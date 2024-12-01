import path from 'path';

import { Project } from 'ts-morph';

import { IdentifierTransformer } from '.';
import { IdentifierTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

const mockTransformInterface = jest.fn();
jest.mock('./transformer-interface', () => ({
  IdentifierInterfaceTransformer: class InterfaceTransformerMock {
    transform(...args: any) {
      return mockTransformInterface(...args);
    }
  },
}));

const imports = {
  base: {
    name: 'BaseIdentifier',
    path: path.resolve(
      __dirname,
      '../../transformer/__mocks__/test.transformer.base.identifier.ts',
    ),
  },
  parser: {
    name: 'Parser',
    path: path.resolve(
      __dirname,
      '../../transformer/__mocks__/test.transformer.base.parser.ts',
    ),
  },
};

interface TestCase {
  structure: ParserResult.Structure;
  mock?: jest.Mock;
}
const testCases: TestCase[] = [
  {
    structure: {
      name: 'TestEnum',
      type: ParserResult.StructureType.ENUM,
      extendingStructures: [],
      properties: [],
      imports: [],
      comment: '',
      path: path.resolve(__dirname, '.'),
    },
  },
  {
    structure: {
      name: 'TestInterface',
      type: ParserResult.StructureType.INTERFACE,
      extendingStructures: [],
      properties: [],
      imports: [],
      comment: '',
      path: path.resolve(__dirname, '.'),
    },
    mock: mockTransformInterface,
  },
  {
    structure: {
      name: 'TestTypeAlias',
      type: ParserResult.StructureType.TYPE_ALIAS,
      extendingStructures: [],
      properties: [],
      imports: [],
      comment: '',
      path: path.resolve(__dirname, '.'),
    },
  },
];

describe(IdentifierTransformer.name, () => {
  beforeEach(() => {
    mockTransformInterface.mockReturnValue(`mockTransformInterface return value`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  testCases.forEach(({ structure, mock }) => {
    const type = structure.type;
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1, type.length);

    if (mock) {
      it(`calls the correct transformer when generating identifier for ${structure.type}`, () => {
        const transformer = new IdentifierTransformer();
        const project = new Project();
        const opts: IdentifierTransformerOpts = {
          project,
          modelFile: project.createSourceFile('foo.ts'),
          outputPath: './foo/bar.ts',
          mustExtendStructureOfName: 'TestInterfaceParent',
          imports,
        };
        const result = transformer.transform(structure, opts);
        expect(result).toBe(`mockTransform${typeCapitalized} return value`);
        expect(mock).toBeCalled();
        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(structure, opts);
      });
    } else {
      it(`throws error when generating identifier for ${structure.type}`, () => {
        const transformer = new IdentifierTransformer();
        const project = new Project();
        const opts: IdentifierTransformerOpts = {
          project,
          modelFile: project.createSourceFile('foo.ts'),
          outputPath: './foo/bar.ts',
          mustExtendStructureOfName: 'TestInterfaceParent',
          imports,
        };
        expect(() => transformer.transform(structure, opts)).toThrowError(
          `Oops! Auto-generated identifiers not supported for entity of type ${structure.type}`,
        );
      });
    }
  });
});
