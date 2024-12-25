import { GraphQLInterfaceTransformer } from './transformer-interface';
import { testInterfaceBasicStructure } from '../__mocks__/test.interface.basic';
import { testInterfaceGenericStructure } from '../__mocks__/test.interface.generic';
import { testInterfaceGenericStructureWithConstraintOnly } from '../__mocks__/test.interface.generic.constraint.only';
import { testInterfaceStructureWithGenericParent } from '../__mocks__/test.interface.generic.parent';
import { testInterfaceStructureWithGenericParentOnlyArrays } from '../__mocks__/test.interface.generic.parent.arrays';
import { testInterfaceSpecialStructure } from '../__mocks__/test.interface.special';

describe('GraphQLInterfaceTransformer', () => {
  it('constructs correct GQL representation for an interface with basic properties', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceBasicStructure)).toMatchInlineSnapshot(`
      "
            "This is a test interface."
            type TestInterfaceWithBasicProperties {
              
              "A string property."
              myStringProperty: String 
            
              "A number property."
              myNumberProperty: Int 
            
              "A boolean property."
              myBooleanProperty: Boolean 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL representation for an input type with basic properties', () => {
    const transformer = new GraphQLInterfaceTransformer();
    const input = transformer.transformInputType(testInterfaceBasicStructure, {
      inputType: { type: 'query', inputNameTransformer: (n) => n },
    });

    expect(input.graphql).toMatchInlineSnapshot(`
      "
            "This is a test interface."
            input TestInterfaceWithBasicProperties {
              
              "A string property."
              myStringProperty: String 
            
              "A number property."
              myNumberProperty: Int 
            
              "A boolean property."
              myBooleanProperty: Boolean 
            
            }
            
            "
    `);
  });

  it('constructs correct GQL representation for an interface with special properties', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceSpecialStructure)).toMatchInlineSnapshot(`
      "
            "This is a test interface with special properties, requiring special handling."
            type TestInterfaceWithSpecialProperties {
              
              "A date property."
              myDateProperty: String 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL representation for an interface with generic properties which have a default and constraint', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceGenericStructure)).toMatchInlineSnapshot(`
      "
            "This is a test interface with a generic type property."
            interface TestInterfaceWithGenericType {
              
              "A generic property."
              myGenericProperty: TestInterfaceConstraintExtender 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL representation for an interface with generic properties which have a constraint only', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceGenericStructureWithConstraintOnly))
      .toMatchInlineSnapshot(`
      "
            "This is a test interface with a generic type property."
            type TestInterfaceWithGenericTypeWithConstraintOnly {
              
              "A generic property."
              myGenericProperty: TestInterfaceConstraint 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL representation for an interface with a parent with generic properties', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceStructureWithGenericParent))
      .toMatchInlineSnapshot(`
      "
            "This is a test interface with a parent interface which accepts type arguments."
            type TestInterfaceWithParentGeneric implements TestInterfaceSuperParent & TestInterfaceParent {
              
              "A string property."
              mySuperParentProperty: String 
            
              "A string property."
              myParentProperty: String 
            
              "A generic property."
              myGenericProperty: TestInterfaceConstraintExtender 
            
              "A second generic property."
              myGenericPropertySecond: String 
            
              "A base property."
              myBaseProperty: String 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL representation for an interface with a parent with generic properties which are arrays', () => {
    const transformer = new GraphQLInterfaceTransformer();
    expect(transformer.transform(testInterfaceStructureWithGenericParentOnlyArrays))
      .toMatchInlineSnapshot(`
      "
            "This is a test interface with a parent interface which accepts type arguments and only has array properties."
            type TestInterfaceWithParentGenericArrayProperties implements TestInterfaceSuperParent & TestInterfaceParentWithArrayProperties {
              
              "A string property."
              mySuperParentProperty: String 
            
              "A string property."
              myParentProperty: [String] 
            
              "A generic property."
              myGenericProperty: [TestInterfaceConstraintExtender] 
            
              "A second generic property."
              myGenericPropertySecond: [String] 
            
              "A base property."
              myBaseProperty: String 
            
            }
            
          "
    `);
  });

  it('constructs correct GQL input representation for an interface marked with @input', () => {
    const transformer = new GraphQLInterfaceTransformer();
    const input = transformer.transformInputType({
      ...testInterfaceStructureWithGenericParentOnlyArrays,
      tags: [['input', '']],
    });

    expect(input.graphql).toMatchInlineSnapshot(`
"
      "This is a test interface with a parent interface which accepts type arguments and only has array properties."
      input TestInterfaceWithParentGenericArrayProperties {
        
        "A string property."
        mySuperParentProperty: String 
      
        "A string property."
        myParentProperty: [String] 
      
        "A generic property."
        myGenericProperty: [TestInterfaceConstraintExtender] 
      
        "A second generic property."
        myGenericPropertySecond: [String] 
      
        "A base property."
        myBaseProperty: String 
      
      }
      
      "
`);
  });
});
