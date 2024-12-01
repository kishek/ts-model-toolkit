import path from 'path';

import { Project } from 'ts-morph';

import { BuilderTransformer } from '.';
import { BuilderTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

const mockTransformInterface = jest.fn();
jest.mock('./transformer-interface', () => ({
  BuilderInterfaceTransformer: class InterfaceTransformerMock {
    transform(...args: any) {
      return mockTransformInterface(...args);
    }
  },
}));

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

describe('GuardTransformer', () => {
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
      it(`calls the correct transformer when generating builder for ${structure.type}`, () => {
        const transformer = new BuilderTransformer();
        const project = new Project();
        const opts: BuilderTransformerOpts = {
          project,
          modelFile: project.createSourceFile('foo.ts'),
          outputPath: './foo/bar.ts',
        };
        const result = transformer.transform(structure, opts);
        expect(result).toBe(`mockTransform${typeCapitalized} return value`);
        expect(mock).toBeCalled();
        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(structure, opts);
      });
    } else {
      it(`throws error when generating builder for ${structure.type}`, () => {
        const transformer = new BuilderTransformer();
        const project = new Project();
        const opts: BuilderTransformerOpts = {
          project,
          modelFile: project.createSourceFile('foo.ts'),
          outputPath: './foo/bar.ts',
        };
        expect(() => transformer.transform(structure, opts)).toThrowError(
          `Oops! Auto-generated builders not supported for entity of type ${structure.type}`,
        );
      });
    }
  });
});
