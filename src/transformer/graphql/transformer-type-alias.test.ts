import { GraphQLTypeAliasTransformer } from './transformer-type-alias';
import { testTypeAliasStructure } from '../__mocks__/test.type-alias.structure';

describe('GraphQLTypeAliasTransformer', () => {
  it('constructs correct GQL representation for a type alias', () => {
    const transformer = new GraphQLTypeAliasTransformer();
    expect(transformer.transform(testTypeAliasStructure)).toMatchInlineSnapshot(`
      "
              "This is a test type alias."
              union TestTypeAlias = String | Int | Boolean | TestInterface
            "
    `);
  });

  it('throw error when type aliases not found', () => {
    const transformer = new GraphQLTypeAliasTransformer();
    expect(() =>
      transformer.transform({ ...testTypeAliasStructure, typeAliases: [] }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Oops! Only type aliases declared as unions are supported 😱"`,
    );
  });
});
