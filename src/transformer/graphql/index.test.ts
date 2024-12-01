import path from 'path';

import { GraphQLTransformer } from '.';
import { ParserResult } from '../../parser/types';

const mockTransformEnum = jest.fn();
jest.mock('./transformer-enum', () => ({
  GraphQLEnumTransformer: class EnumTransformerMock {
    transform(...args: any) {
      return mockTransformEnum(...args);
    }
  },
}));
const mockTransformInterface = jest.fn();
jest.mock('./transformer-interface', () => ({
  GraphQLInterfaceTransformer: class InterfaceTransformerMock {
    transform(...args: any) {
      return mockTransformInterface(...args);
    }
  },
}));
const mockTransformTypeAlias = jest.fn();
jest.mock('./transformer-type-alias', () => ({
  GraphQLTypeAliasTransformer: class TypeAliasTransformerMock {
    transform(...args: any) {
      return mockTransformTypeAlias(...args);
    }
  },
}));

interface TestCase {
  structure: ParserResult.Structure;
  mock: jest.Mock;
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
    mock: mockTransformEnum,
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
    mock: mockTransformTypeAlias,
  },
];

describe('GraphQLTransformer', () => {
  beforeEach(() => {
    mockTransformEnum.mockReturnValue(`mockTransformEnum return value`);
    mockTransformInterface.mockReturnValue(`mockTransformInterface return value`);
    mockTransformTypeAlias.mockReturnValue(`mockTransformTypeAlias return value`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  testCases.forEach(({ structure, mock }) => {
    const type = structure.type;
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1, type.length);
    it(`calls the correct transformer when transforming ${structure.type} to GQL`, () => {
      const transformer = new GraphQLTransformer();
      const result = transformer.transform(structure);
      expect(result).toBe(`mockTransform${typeCapitalized} return value`);
      expect(mock).toBeCalled();
      expect(mock).toBeCalledTimes(1);
      expect(mock).toBeCalledWith(structure, undefined);
    });
  });
});
