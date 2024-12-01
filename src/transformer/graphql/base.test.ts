import { GraphQLBaseTransformer } from './base';
import { GraphQLTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';
import { testInterfaceBasicStructure as testInterfaceTypeWithProperties } from '../__mocks__/test.interface.basic';
import { testBooleanType } from '../__mocks__/test.type.boolean';
import { testEnumMemberType } from '../__mocks__/test.type.enum-member';
import { testIdentifierType } from '../__mocks__/test.type.identifier';
import { testInterfaceType } from '../__mocks__/test.type.interface';
import { testNumberType } from '../__mocks__/test.type.number';
import { testStringType } from '../__mocks__/test.type.string';
import { testTupleAndRestType } from '../__mocks__/test.type.tuple-and-rest-types';
import { testTypeAliasType } from '../__mocks__/test.type.type-alias';
import { testTypeReferenceType } from '../__mocks__/test.type.type-reference-with-array';
import { testTypeReferenceGenericWithDefaultAndConstraintType } from '../__mocks__/test.type.type-reference-with-generic';
import { testUnionType } from '../__mocks__/test.type.union-type';
import { testUnknownType } from '../__mocks__/test.type.unknown';

// Below taken from assorted snapshots.
const testTypes: ParserResult.Type[] = [
  testStringType,
  testNumberType,
  testBooleanType,
  testEnumMemberType,
  testInterfaceType,
  testTypeReferenceType,
  testTypeReferenceGenericWithDefaultAndConstraintType,
  testTypeAliasType,
  testIdentifierType,
  testUnionType,
  testTupleAndRestType,
];

class TestGraphQLTransformer extends GraphQLBaseTransformer {
  public getGraphQLTypeProxy(type: ParserResult.Type): string {
    return this.getGraphQLType(type);
  }

  public getGraphQLNullableMarkerProxy(
    property: ParserResult.Property,
    opts?: GraphQLTransformerOpts,
  ): string {
    return this.getGraphQLNullableMarker(property, opts);
  }
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation();
});

afterEach(jest.clearAllMocks);

describe('GraphQLBaseTransformer', () => {
  describe('getGraphQLType', () => {
    testTypes.forEach((testType) => {
      it(`constructs correct GQL for Type.${testType.kind.name}`, () => {
        const transformer = new TestGraphQLTransformer();
        expect(transformer.getGraphQLTypeProxy(testType)).toMatchSnapshot();
      });
    });

    it('falls back to `Unknown` as GQL type when unsupported kind supplied', () => {
      const transformer = new TestGraphQLTransformer();
      expect(transformer.getGraphQLTypeProxy(testUnknownType)).toMatchInlineSnapshot(
        `"Unknown"`,
      );
    });
  });

  describe('getGraphQLNullableProperty', () => {
    it('inherits required value from parsed type - is required property', () => {
      const transformer = new TestGraphQLTransformer();
      const testProperty = testInterfaceTypeWithProperties.properties[0];
      expect(
        transformer.getGraphQLNullableMarkerProxy(testProperty, {
          inheritNullabilityFromStructure: true,
        }),
      ).toBe('!');
    });

    it('inherits required value from parsed type - is not required property', () => {
      const transformer = new TestGraphQLTransformer();
      const testProperty = testInterfaceTypeWithProperties.properties[0];
      expect(
        transformer.getGraphQLNullableMarkerProxy(
          { ...testProperty, isRequired: false },
          {
            inheritNullabilityFromStructure: true,
          },
        ),
      ).toBe('');
    });

    it('defaults to not required when not inheriting required property', () => {
      const transformer = new TestGraphQLTransformer();
      const testProperty = testInterfaceTypeWithProperties.properties[0];
      expect(
        transformer.getGraphQLNullableMarkerProxy(testProperty, {
          inheritNullabilityFromStructure: false,
        }),
      ).toBe('');
    });
  });
});
