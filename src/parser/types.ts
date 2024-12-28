import {
  EnumDeclaration,
  InterfaceDeclaration,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'ts-morph';

/**
 * A set of TypeScript declarations which are supported by the parser.
 */
export type SupportedDeclaration =
  | EnumDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration;

/**
 * A type extracted from SyntaxKind for the name of a TypeScript kind.
 */
export type KindName = keyof typeof SyntaxKind;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ParserResult {
  /**
   * The type of TypeScript construct which has been parsed.
   */
  export enum StructureType {
    /**
     * An interface in TypeScript represents a bag of properties.
     */
    INTERFACE = 'interface',
    /**
     * An enum in TypeScript is a commonplace mapping between keys and scalar values.
     */
    ENUM = 'enum',
    /**
     * A type alias in TypeScript allows for unions to be defined. Otherwise, it functions largely
     * as an interface, and can hold onto a bag of properties, or reference other types.
     */
    TYPE_ALIAS = 'typeAlias',
  }

  /**
   * The structure of the parsed result.
   */
  export interface Structure {
    /**
     * The name of the TypeScript construct.
     */
    name: string;
    /**
     * The type of structure.
     */
    type: StructureType;
    /**
     * The parent structures which this structure inherits or extends.
     */
    extendingStructures: Structure[];
    /**
     * A comment detailing this structure.
     */
    comment: string;
    /**
     * A set of comment tags, treated as additional metadata for the type.
     */
    tags?: [string, string][];
    /**
     * The properties which compose this structure.
     */
    properties: Property[];
    /**
     * The type aliases which compose this structure.
     */
    typeAliases?: Type[];
    /**
     * The imports which this structure references as part of its file definition.
     */
    imports: Import[];
    /**
     * A marker for whether this structure is a base structure, extended by other structures.
     */
    isBaseStructure?: boolean;
    /**
     * A list of type parameters used in the definition of this structure.
     */
    typeParameters?: Type[];
    /**
     * A list of type arguments used in extending structures.
     */
    typeArguments?: ExtendingType[];
    /**
     * The source path for the structure (in TypeScript).
     */
    path: string;
  }

  /**
   * A property defined as part of a structure.
   */
  export interface Property {
    /**
     * The name of the property being referenced.
     */
    name: string;
    /**
     * The type of the property being referenced.
     */
    type: Type;
    /**
     * A comment representing this property.
     */
    comment: string;
    /**
     * Imports used by this property, or the structure in which this property sits.
     */
    imports: Import[];
    /**
     * Whether this property is required.
     */
    isRequired: boolean;
    /**
     * A set of comment tags, treated as additional metadata for the type.
     */
    tags?: [string, string][];
  }

  /**
   * Represents a structure which another structure depends on.
   */
  export interface Import {
    /**
     * The name of the import.
     */
    name: string;
    /**
     * The provided path from the current structure to the import. Note: this
     * should *not* be used where possible for inferring the path to the import.
     */
    path: string;
  }

  /**
   * A generic type interface. This is used to describe the type of a property,
   * member, type argument, etc..
   */
  export interface Type {
    /**
     * The raw typescript representation of this type.
     */
    raw: string;
    /**
     * The raw TypeScript kind of this type.
     */
    kind: Kind;
    /**
     * The elements part of an aggregate type (array, tuple).
     */
    elements?: Type[];
    /**
     * The type arguments used to represent this type.
     */
    typeArguments?: Type[];
    /**
     * The supplied type for this type (optional, applicable only to certain generics).
     */
    suppliedValue?: Type;
    /**
     * The default type for this type (optional, applicable only to certain generics).
     */
    defaultValue?: Type;
    /**
     * The constraint applied on this type.
     */
    constraintValue?: Type;
    /**
     * The source path of the type, if applicable (generic type).
     */
    path?: string;
  }

  /**
   * An interface defining the type arguments of an extending interface.
   */
  export interface ExtendingType {
    /**
     * The name of the interface being extended.
     */
    name: string;
    /**
     * The type arguments associated with this extending interface clause.
     */
    typeArguments: Type[];
  }

  /**
   * The kind of a type. Represented in its raw integer form (known to the TypeScript compiler)
   * and the human-readable name of the kind.
   */
  export interface Kind {
    /**
     * The enum value of this kind in the TypeScript compiler API.
     */
    value: SyntaxKind;
    /**
     * The human readable name of the kind.
     */
    name: KindName;
  }
}

export { Parser } from './parser-base';
