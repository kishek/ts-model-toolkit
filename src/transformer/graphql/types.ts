import { Project } from 'ts-morph';
import { ParserResult } from '../../parser';

export interface GraphQLTransformerOpts {
  /**
   * Indicates whether the 'required' or 'not required' marker in TypeScript
   * needs to be reflected back into the GraphQL representation.
   */
  inheritNullabilityFromStructure?: boolean;
  /**
   * Indicates whether the `@key` directive needs to be attached to generated
   * GQL files, to support Apollo Federation.
   * @link https://www.apollographql.com/docs/federation/#federated-schema-example
   */
  useApolloFederationKeyDirective?: boolean;
  /**
   * Indicates whether the `@shareable` directive needs to be attached to generated
   * GQL files, to support Apollo Federation.
   * @link https://www.apollographql.com/docs/federation/federated-types/federated-directives/#shareable
   */
  useApolloFederationShareableDirective?: boolean;
  /**
   * Indicates whether the Relay connection specification should be used for certain
   * qualifiers. These are supplied as parameters below.
   * @link https://relay.dev/graphql/connections.htm
   */
  useRelayConnectionSpecification?: {
    /**
     * The qualifiers for which the Relay connection specification should be used.
     */
    qualifiers: string[];
  };
  /**
   * Indicates whether the current structure should be treated as a GraphQL input type.
   */
  inputType?: GraphQLInputTypeParams;
}

export interface GraphQLResolverTransformerOpts {
  /**
   * File to place all resolvers into. Assumes there is a `resolvers` export.
   */
  target: string;
  /**
   * Project in which all files live.
   */
  project: Project;
}

export type GraphQLInputTypeParams = {
  /**
   * The resolver type for which an input type is being generated.
   */
  type: 'query' | 'mutation';
  /**
   * Transformer for the GraphQL input schema's name.
   */
  inputNameTransformer: (name: string) => string;
  /**
   * Transformer for the GraphQL resolver's name.
   */
  resolverNameTransformer?: (name: string) => string;
  /**
   * Generate a resolver for the input type.
   */
  resolver?: {
    /**
     * Target dir of the resolver, necessary for producing imports
     */
    dir: string;
    /**
     * The project in which all files live, necessary for producing imports
     */
    project: Project;
    /**
     * Templated resolver definition.
     * @description RESOLVER_NAME used for exported resolver name
     * @description RESOLVER_INPUT_TYPE used for input argument
     * @description RESOLVER_RESULT used for output / return value
     */
    template: string;
  };
};

export interface GraphQLTransformPropertyResult {
  /**
   * The raw GraphQL result of the transformer.
   */
  graphql: string;
  /**
   * The additional GraphQL declarations which the `graphql` result depends on.
   */
  additionalDeclarations: string[];
}

export type GraphQLResolver = {
  /**
   * TypeScript file definition.
   */
  contents: string;
  /**
   * Where in the filesystem the resolver should be written to.
   */
  path: string;
  /**
   * Final name of the resolver - its export symbol.
   */
  name: string;
  /**
   * The kind of resolver being generated.
   */
  type: 'query' | 'mutation';
};

export interface GraphQLResolverResponse {
  /**
   * GraphQL transformation of the incoming structure.
   */
  graphql: string;
  /**
   * A complete resolver definition which can be placed in a file.
   */
  resolver?: GraphQLResolver;
}

export type GraphQLTransformerOutput = string | GraphQLResolverResponse;
