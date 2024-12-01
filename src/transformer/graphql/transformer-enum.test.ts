import { GraphQLEnumTransformer } from './transformer-enum';
import { testEnumStructure } from '../__mocks__/test.enum.structure';

describe('GraphQLEnumTransformer', () => {
  it('constructs correct GQL representation for an enum', () => {
    const transformer = new GraphQLEnumTransformer();
    expect(transformer.transform(testEnumStructure)).toMatchInlineSnapshot(`
      "
            "This is a test enum."
            enum TestEnum {
              
              "A test enum key/value pair."
              ENUM_KEY_STRING
          
              "Another test enum key/value pair"
              ENUM_KEY_NUMBER
          
            }
          "
    `);
  });
});
