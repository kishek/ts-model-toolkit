import { Project } from 'ts-morph';

import { GetGuardOpts, GuardBaseTransformer } from './base';
import { ParserResult } from '../../parser/types';
import { testBooleanType } from '../__mocks__/test.type.boolean';
import { testIdentifierType } from '../__mocks__/test.type.identifier';
import { testInterfaceType } from '../__mocks__/test.type.interface';
import { testNumberType } from '../__mocks__/test.type.number';
import { testStringType } from '../__mocks__/test.type.string';
import { testTupleAndRestType } from '../__mocks__/test.type.tuple-and-rest-types';
import { testTypeAliasType } from '../__mocks__/test.type.type-alias';
import { testTypeArgumentType } from '../__mocks__/test.type.type-argument';
import { testTypeReferenceType } from '../__mocks__/test.type.type-reference-with-array';
import { testTypeReferenceGenericWithDefaultAndConstraintType } from '../__mocks__/test.type.type-reference-with-generic';
import { testUnionType } from '../__mocks__/test.type.union-type';
import { testUnknownType } from '../__mocks__/test.type.unknown';

// Below taken from assorted snapshots.
const testTypes: ParserResult.Type[] = [
  testStringType,
  testNumberType,
  testBooleanType,
  testIdentifierType,
  testInterfaceType,
  testTypeReferenceType,
  testTypeReferenceGenericWithDefaultAndConstraintType,
  testTypeAliasType,
  testUnionType,
  testTupleAndRestType,
  testTypeArgumentType,
];

class TestGraphQLTransformer extends GuardBaseTransformer {
  public getGuardProxy(opts: GetGuardOpts): string {
    return this.getGuard(opts);
  }
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation();
});

afterEach(jest.clearAllMocks);

describe('GuardBaseTransformer', () => {
  testTypes.forEach((testType) => {
    it(`constructs correct type guard for Type.${testType.kind.name}`, () => {
      const transformer = new TestGraphQLTransformer();
      expect(
        transformer.getGuardProxy({
          type: testType,
          imports: [],
          file: new Project().createSourceFile('foo.ts'),
        }),
      ).toMatchSnapshot();
    });
  });

  it('falls back to `false` to invalidate type guard when unsupported kind supplied', () => {
    const transformer = new TestGraphQLTransformer();
    expect(
      transformer.getGuardProxy({
        type: testUnknownType,
        imports: [],
        file: new Project().createSourceFile('foo.ts'),
      }),
    ).toMatchInlineSnapshot(`"false"`);
  });
});
