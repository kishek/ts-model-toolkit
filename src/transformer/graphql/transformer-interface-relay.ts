import { GraphQLInterfaceTransformer } from './transformer-interface';
import { GraphQLTransformerOpts, GraphQLTransformPropertyResult } from './types';
import { ParserResult } from '../../parser/types';

export class GraphQLInterfaceRelayTransformer extends GraphQLInterfaceTransformer {
  protected transformProperty(
    structure: ParserResult.Structure,
    property: ParserResult.Property,
    opts?: GraphQLTransformerOpts,
  ): GraphQLTransformPropertyResult {
    if (!opts?.useRelayConnectionSpecification?.qualifiers.includes(property.type.raw)) {
      return super.transformProperty(structure, property, opts);
    }
    const type = this.transformType(property);
    const propertyName =
      property.name[0].toUpperCase() + property.name.slice(1, property.name.length);
    const relationshipIdentifier = `${structure.name}${propertyName}`;
    const result = {
      graphql: this.buildRelationshipGQL(property, relationshipIdentifier),
      additionalDeclarations: [
        this.buildPageInfoGQL(structure, property, relationshipIdentifier),
        this.buildConnectionGQL(structure, property, relationshipIdentifier),
        this.buildEdgeGQL(structure, property, relationshipIdentifier, type),
      ],
    };
    return this.withPropertyImport(
      property,
      structure,
      type,
      relationshipIdentifier,
      result,
    );
  }

  private buildRelationshipGQL(
    property: ParserResult.Property,
    relationshipIdentifier: string,
  ) {
    const relationshipFieldName = `${property.name}Connection`;
    const connectionName = `${relationshipIdentifier}Connection`;
    return `
      "${property.comment}"
      ${relationshipFieldName}(
        first: Int,
        after: String,
        last: Int,
        before: String
      ): ${connectionName}
    `;
  }

  private buildPageInfoGQL(
    structure: ParserResult.Structure,
    property: ParserResult.Property,
    relationshipIdentifier: string,
  ) {
    const pageInfoName = `${relationshipIdentifier}PageInfo`;
    return `
      "Page info for connection between ${structure.name} and ${property.name}"
      type ${pageInfoName} {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
      }
    `;
  }

  private buildConnectionGQL(
    structure: ParserResult.Structure,
    property: ParserResult.Property,
    relationshipIdentifier: string,
  ) {
    const connectionName = `${relationshipIdentifier}Connection`;
    const edgeName = `${relationshipIdentifier}Edge`;
    const pageInfoName = `${relationshipIdentifier}PageInfo`;
    return `
      "Connection between ${structure.name} and ${property.name}"
      type ${connectionName} {
        pageInfo: ${pageInfoName}!
        edges: [${edgeName}]
      }
    `;
  }

  private buildEdgeGQL(
    structure: ParserResult.Structure,
    property: ParserResult.Property,
    relationshipIdentifier: string,
    type: string,
  ) {
    const edgeName = `${relationshipIdentifier}Edge`;
    return `
      "Edge between ${structure.name} and ${property.name}"
      type ${edgeName} {
        cursor: String!
        node: ${type}
      }
    `;
  }

  private withPropertyImport(
    property: ParserResult.Property,
    structure: ParserResult.Structure,
    type: string,
    relationshipIdentifier: string,
    result: GraphQLTransformPropertyResult,
  ) {
    const propertyImport = this.getImportForProperty(property, type);
    // NOTE: imports which start with `@` are assumed to be from a different package. In this case, to support
    // Apollo Federation, we need to introduce an extending type. We additionally add a back-reference.
    if (propertyImport?.path.startsWith('@')) {
      result.additionalDeclarations.push(
        `
          type ${type} @key(fields: "id") {
            "The external ID reference for this entity."
            id: ID! @shareable
            "The associated ${
              structure.name
            } accessible through ${relationshipIdentifier}Connection"
            ${structure.name.toLowerCase()}: ${structure.name}
          }
        `,
      );
      return result;
    }
    return result;
  }
}
