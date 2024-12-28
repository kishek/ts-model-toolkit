import flattenDeep from 'lodash.flattendeep';
import {
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  Node,
  PropertySignature,
  SyntaxKind,
  TypeNode,
  ts,
  createWrappedNode,
} from 'ts-morph';

import { Parser } from './parser-base';
import { KindName, ParserResult } from './types';
import { getExport, sanitizePath, sanitizeType } from './util';

export class InterfaceParser extends Parser<InterfaceDeclaration> {
  public parse(declaration: InterfaceDeclaration): ParserResult.Structure {
    const structure = declaration.getStructure();

    const comment = this.getComment(structure).trim();
    const tags = this.getTags(declaration);
    const imports = this.getImports(declaration);

    const { properties, typeArguments, typeParameters } = this.getTypeProperties(
      declaration,
      imports,
      structure,
    );

    const extendingStructures = this.getExtendingStructures(declaration, typeArguments);
    const path = declaration.getSourceFile().getFilePath();

    return {
      name: structure.name,
      type: ParserResult.StructureType.INTERFACE,
      comment,
      tags,
      imports,
      properties,
      extendingStructures,
      typeParameters,
      typeArguments,
      path: sanitizePath(path),
    };
  }

  private getTypeProperties(
    declaration: InterfaceDeclaration,
    imports: ParserResult.Import[],
    structure: InterfaceDeclarationStructure,
  ) {
    let typeParameters = this.getTypeParameters(declaration, imports);
    let properties = this.getProperties(structure, declaration, imports, typeParameters);
    let typeArguments = this.getTypeArguments(declaration);

    if (process.env.NODE_ENV === 'test') {
      properties = properties.map((property) => ({
        ...property,
        type: sanitizeType(property.type),
      }));
      typeParameters = typeParameters.map(sanitizeType);
      typeArguments = typeArguments.map((typeArgument) => {
        return {
          ...typeArgument,
          typeArguments: typeArgument.typeArguments.map(sanitizeType),
        };
      });
    }

    return { typeArguments, properties, typeParameters };
  }

  private getProperties(
    structure: InterfaceDeclarationStructure,
    declaration: InterfaceDeclaration,
    imports: ParserResult.Import[],
    typeParameters: ParserResult.Type[],
  ): ParserResult.Property[] {
    if (structure.properties && structure.properties.length > 0) {
      return structure.properties.map((property) => {
        if (typeof property.type === 'string') {
          const propertyDeclaration = declaration.getPropertyOrThrow(property.name);
          const propertyType = this.getTypeFromPropertySignature(
            propertyDeclaration,
            typeParameters,
          );
          const propertyImport = imports.find((maybeImport) => {
            if (
              maybeImport.name === propertyType.raw ||
              maybeImport.name === propertyType.defaultValue?.raw ||
              maybeImport.name === propertyType.constraintValue?.raw ||
              propertyType.typeArguments?.some(
                (typeArgument) => typeArgument.raw === maybeImport.name,
              )
            ) {
              return true;
            }
            return false;
          });
          const comment = this.getComment(property);
          const tags = this.getTags(propertyDeclaration);

          return {
            name: property.name,
            comment,
            imports: propertyImport ? [propertyImport] : [],
            isRequired: !property.hasQuestionToken,
            type: propertyType,
            tags,
          };
        }
        throw new Error(`No type parseable for ${property.name} property.`);
      });
    }
    return [];
  }

  private getTypeFromPropertySignature(
    signature: PropertySignature,
    typeParameters: ParserResult.Type[],
  ): ParserResult.Type {
    // NOTE: a signature is structured like so:
    // ```
    //    myProperty: boolean;
    // ```
    // Hence, we define 'left' as the name, and 'right' as the type.
    const [, right] = [signature.getName(), signature.getTypeNodeOrThrow()];
    return this.getTypeFromTypeNode(right, typeParameters);
  }

  private getTypeFromTypeNode(
    typeNode: TypeNode,
    typeParameters: ParserResult.Type[],
  ): ParserResult.Type {
    const { kind, raw } = this.toType(typeNode);

    // If we have a type parameter definition which captures the definition for this type node,
    // we do not try and parse its type information further.
    const typeParameter = typeParameters.find(
      (typeParameter) => typeParameter.raw === raw,
    );
    if (typeParameter) {
      return typeParameter;
    }

    // Otherwise, we establish a mapping specific to this type node.
    switch (kind.value) {
      case SyntaxKind.NumberKeyword:
      case SyntaxKind.StringKeyword:
      case SyntaxKind.BooleanKeyword:
      case SyntaxKind.EnumKeyword:
      case SyntaxKind.TypeReference: {
        if (TypeNode.isTypeReference(typeNode)) {
          const typeName = typeNode.getTypeName();
          const typeArguments = typeNode.getTypeArguments().map(this.toType);
          // NOTE: a qualified name is of format -
          // ```
          //    TEST_ENUM.FOO
          // ```
          // Hence, left refers to the actual 'type' whilst the right refers
          // to a specific member of that type.
          if (TypeNode.isQualifiedName(typeName)) {
            const [left, right] = [typeName.getLeft(), typeName.getRight()];
            return {
              ...this.toType(left),
              defaultValue: this.toType(right),
              typeArguments,
            };
          }
          return { raw, kind, typeArguments };
        }
        return { raw, kind };
      }
      case SyntaxKind.ArrayType: {
        if (TypeNode.isArrayTypeNode(typeNode)) {
          // NOTE: a qualified name is of format -
          // ```
          //    TestInterface[]
          // ```
          // Hence, left refers to the actual type of the array.
          const elementType = typeNode.getElementTypeNode();
          const elementTypeInfo = this.getTypeFromTypeNode(elementType, typeParameters);
          return {
            raw,
            kind,
            elements: [elementTypeInfo],
          };
        }
      }
      case SyntaxKind.TupleType: {
        // NOTE: a qualified name is of format -
        // ```
        //    [TestInterfaceA, TestInterfaceB]
        //    [TestInterfaceA, ...TestInterfaceB[]]
        // ```
        // Hence, each constituting element is parsed separately.
        if (TypeNode.isTupleTypeNode(typeNode)) {
          const elements = typeNode.getElements();
          return {
            raw,
            kind,
            elements: elements.map((element) =>
              this.getTypeFromTypeNode(element, typeParameters),
            ),
          };
        }
      }
      case SyntaxKind.RestType: {
        // NOTE: a rest type is of format -
        // ```
        //    ...TestInterfaceA[]
        // ```
        // Hence, the core element type is parsed.
        if (ts.isRestTypeNode(typeNode.compilerNode)) {
          const typeNodeFromCompiler = createWrappedNode(typeNode.compilerNode.type);
          return {
            raw,
            kind,
            elements: [
              // NOTE: we wrap the raw compiler type for rest types due to
              // lack of support in `ts-morph` at current.
              this.getTypeFromTypeNode(typeNodeFromCompiler, typeParameters),
            ],
          };
        }
      }
      case SyntaxKind.UnionType: {
        // NOTE: a union type is of format -
        // ```
        //    string | number | boolean
        //    TestInterfaceA | TestInterfaceB | TestInterfaceC
        //    TestInterfaceA | TestInterfaceB | TestInterfaceC[]
        // ```
        // Hence, the core element type is parsed.
        if (TypeNode.isUnionTypeNode(typeNode)) {
          const elements = typeNode.getTypeNodes();
          return {
            raw,
            kind,
            elements: elements.map((element) =>
              this.getTypeFromTypeNode(element, typeParameters),
            ),
          };
        }
      }
      case SyntaxKind.IndexedAccessType: {
        // NOTE: an indexed access type is of formamt -
        // ```
        //  myInterface['type']
        // ```
        // Hence, we follow the path down to compute the final 'type' for this reference.
        // For this type, left refers to the 'objectType' and right refers to the 'indexedType'.
        if (TypeNode.isIndexedAccessTypeNode(typeNode)) {
          const [left, right] = [
            typeNode.getObjectTypeNode(),
            typeNode.getIndexTypeNode(),
          ];
          const leftType = this.getTypeFromTypeNode(left, typeParameters);

          // Get the entire structure of the type reference.
          const leftTypeDeclaredIn = leftType.constraintValue?.path || leftType.raw;
          const leftTypeSourceFile = typeNode
            .getProject()
            .getSourceFileOrThrow(`${leftTypeDeclaredIn}.ts`);

          // NOTE: we assume that only interfaces can be indexed at current.
          // ------------------------------
          // We 'follow' the indexed literal down to discover the 'real' type for this property.
          const leftTypeStructure = this.parse(
            getExport(leftTypeSourceFile) as InterfaceDeclaration,
          );
          const leftFinalType = leftTypeStructure.properties.find((property) => {
            return `'${property.name}'` === right.getText();
          });

          if (leftFinalType) {
            return leftFinalType.type;
          } else {
            console.warn(
              `Oops! Unable to follow ${right.getText()} to definition in ${leftTypeDeclaredIn}`,
            );
          }
        }
      }
      default:
        return {
          raw: 'unknown',
          kind,
        };
    }
  }

  private getTypeParameters(
    declaration: InterfaceDeclaration,
    imports: ParserResult.Import[],
  ): ParserResult.Type[] {
    const typeArguments = declaration.getTypeParameters();
    const typeArgumentsImportOpts = {
      declaredIn: declaration.getSourceFile().getFilePath(),
      imports,
    };

    if (typeArguments.length > 0) {
      return typeArguments.map((typeArgument) => {
        // If the type argument has defaults and constraints set on it, we note that
        // they must all share the same 'kind', otherwise they cannot be related. Hence,
        // if a default or constraint value is present, we use that `kind` to define the
        // the `kind` of the current type.
        const defaultValue = typeArgument.getDefault();
        const constraintValue = typeArgument.getConstraint();
        const kind = defaultValue?.getKind() || constraintValue?.getKind();
        const kindName = defaultValue?.getKindName() || constraintValue?.getKindName();

        const typeArgumentAsType: ParserResult.Type = {
          raw: typeArgument.getName(),
          kind: {
            value: kind || SyntaxKind.AnyKeyword,
            name: (kindName as KindName) || 'AnyKeyword',
          },
        };

        if (defaultValue) {
          typeArgumentAsType.defaultValue = this.withPath(
            this.toType(defaultValue),
            typeArgumentsImportOpts,
          );
        }
        if (constraintValue) {
          typeArgumentAsType.constraintValue = this.withPath(
            this.toType(constraintValue),
            typeArgumentsImportOpts,
          );
        }

        return typeArgumentAsType;
      });
    }
    return [];
  }

  public getExtendingStructures(
    declaration: InterfaceDeclaration,
    typeArguments: ParserResult.ExtendingType[],
  ): ParserResult.Structure[] {
    const extenders = declaration.getBaseDeclarations();

    if (extenders.length > 0) {
      const extendingStructures = extenders.map((extender) => {
        if (Node.isInterfaceDeclaration(extender)) {
          const extendingStructure = this.parse(extender);
          const { name, properties } = extendingStructure;
          // Patch in any type arguments which are passed from the child interface.
          const argument = typeArguments.find(
            (typeArgument) => typeArgument.name === name,
          );
          if (argument) {
            const types = argument.typeArguments;
            // ------------------------------------
            // Using the type parameters which are accepted by the parent, map them
            // to the correct properties. The way this would work is:
            // 1) We get the type parameters accepted by the parent.
            // 2) We get a hold of the properties in the parent which use those type parameters.
            // 3) We supply the type information of those properties with those of the type argument from the child.
            // ------------------------------------
            // 1) Get type parameters.
            const typeParameters = extendingStructure.typeParameters;
            if (typeParameters) {
              // 2) Get the property references which correspond.
              typeParameters.forEach((typeParameter, index) => {
                // NOTE: enhance this type with imports. These can be used for further
                // analysis at later points/in transformers.
                const typeFromChild = this.withPath(types[index], {
                  declaredIn: extender.getSourceFile().getFilePath(),
                  imports: extendingStructure.imports,
                });

                properties.forEach((property) => {
                  // 3.1) Base case - the property is used in the top-level.
                  if (property.type.raw === typeParameter.raw) {
                    property.type.suppliedValue = typeFromChild;
                  }
                  // 3.2) Advanced case - the property is used in a nested fashion, in an aggregate.
                  const elements = property.type.elements;
                  if (elements && elements.length > 0) {
                    const elementsWithType = elements.filter(
                      (element) => element.raw === typeParameter.raw,
                    );
                    return elementsWithType.forEach((elementWithType) => {
                      elementWithType.suppliedValue = typeFromChild;
                    });
                  }
                });
              });
            }
          }
          return extendingStructure;
        } else {
          const name = declaration.getName();
          const kind = extender.getKindName();
          console.warn(
            `Only interfaces are can be extended! ${name} extends a structure of kind ${kind}`,
          );
        }
      });
      return extendingStructures.filter((e): e is ParserResult.Structure => !!e);
    }
    return [];
  }

  public getTypeArguments(
    declaration: InterfaceDeclaration,
  ): ParserResult.ExtendingType[] {
    const parents = declaration.getExtends();
    if (parents.length > 0) {
      return flattenDeep(
        parents.map((parent) => {
          // NOTE: an extending type looks like:
          // ```
          // ChildInterface extends ParentInterface<Constraint>
          // ```
          // Hence, the left becomes the expression, and right becomes the type arguments.
          const [expression, typeArguments] = [
            parent.getExpression(),
            parent.getTypeArguments(),
          ];
          if (typeArguments.length > 0) {
            return {
              name: expression.getText(),
              typeArguments: typeArguments.map(this.toType),
            };
          }
        }),
      ).filter(
        (extendingType): extendingType is ParserResult.ExtendingType => !!extendingType,
      );
    }
    return [];
  }
}
