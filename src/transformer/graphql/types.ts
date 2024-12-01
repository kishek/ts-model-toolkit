export interface GraphQLTransformerOpts extends Record<string, unknown> {
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
  inputType?: {
    /**
     * Transformer for the GraphQL input schema's name.
     */
    nameTransformer: (name: string) => string;
  };
}

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
