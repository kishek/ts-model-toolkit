import { GraphQLBaseTransformer } from './base';
import { GraphQLTransformerOpts, GraphQLTransformPropertyResult } from './types';
import { ParserResult } from '../../parser/types';

export class GraphQLInterfaceTransformer extends GraphQLBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ): string {
    const keyword = structure.isBaseStructure ? 'interface' : 'type';
    const allProperties = this.getAllProperties(structure);
    const allPropertiesGraphQL = allProperties.map((prop) =>
      this.transformProperty(structure, prop, opts),
    );
    const directives = this.getDirectives(structure, allProperties, opts);
    const parents = this.transformExtendingStructures(structure);

    if (!opts?.inputType) {
      return `
      "${structure.comment}"
      ${keyword} ${structure.name}${parents}${directives} {
        ${allPropertiesGraphQL.map((prop) => prop.graphql).join('')}
      }
      ${allPropertiesGraphQL
        .map((prop) => prop.additionalDeclarations.join('\n'))
        .join('')}
    `;
    } else {
      const inputName = opts.inputType.inputNameTransformer(structure.name);
      const input = `
      "${structure.comment}"
      input ${inputName} {
        ${allPropertiesGraphQL.map((prop) => prop.graphql).join('')}
        }
        ${allPropertiesGraphQL
          .map((prop) => prop.additionalDeclarations.join('\n'))
          .join('')}
          `;

      const resolver = this.getResolver(structure, opts);
      const schemaType = opts.inputType.type === 'query' ? 'Query' : 'Mutation';

      if (resolver) {
        return `${input}
        
        type ${schemaType} {
          ${resolver}
        }
        `;
      } else {
        return input;
      }
    }
  }

  private getDirectives(
    structure: ParserResult.Structure,
    properties: ParserResult.Property[],
    opts?: GraphQLTransformerOpts,
  ): string {
    const directives: string[] = [];

    if (!structure.isBaseStructure && opts?.useApolloFederationKeyDirective) {
      if (properties.some((property) => property.name === 'id')) {
        directives.push(`@key(fields: "id")`);
      }
    }

    if (!structure.isBaseStructure && opts?.useApolloFederationShareableDirective) {
      directives.push(`@shareable`);
    }

    if (directives.length) {
      return ` ${directives.join(' ')}`;
    } else {
      return '';
    }
  }

  private getResolver(structure: ParserResult.Structure, opts: GraphQLTransformerOpts) {
    if (!opts.inputType?.resolverNameTransformer) {
      return '';
    }

    const inputName = opts.inputType.inputNameTransformer(structure.name);

    const resolver = opts.inputType.resolverNameTransformer(structure.name);
    const resolverResult = structure.tags?.find((t) => t[0] === 'returns') ?? 'Boolean';
    const resolverSignature = resolverResult[1];

    return `${resolver}(input: ${inputName}!): ${resolverSignature}`;
  }

  protected transformProperty(
    structure: ParserResult.Structure,
    property: ParserResult.Property,
    opts?: GraphQLTransformerOpts,
  ): GraphQLTransformPropertyResult {
    const required = this.getGraphQLNullableMarker(property, opts);
    const type = this.transformType(property);
    const propertyImport = this.getImportForProperty(property, type);

    const isBase = structure.isBaseStructure;
    const isShareableSupported =
      !opts?.useApolloFederationShareableDirective &&
      opts?.useApolloFederationKeyDirective &&
      !opts.inputType;
    const isShareable = type === 'ID';
    const isLeaf = typeof isBase === 'boolean' && !isBase;
    const directive = isShareableSupported && isShareable && isLeaf ? '@shareable' : '';

    const result: GraphQLTransformPropertyResult = {
      graphql: `
        "${property.comment}"
        ${property.name}: ${type}${required} ${directive}
      `,
      additionalDeclarations: [],
    };

    // NOTE: this reperesents an entity from a different package. In this case, in order
    // for Apollo Federation to work, we need to refer to it with an `extend`.
    if (propertyImport?.path.startsWith('@') && !opts?.inputType) {
      if (opts?.useApolloFederationKeyDirective) {
        result.additionalDeclarations.push(`
          type ${type} @key(fields: "id", resolvable: false) {
            "The external ID reference for this entity."
            id: ID! @shareable
          }
      `);
      } else {
        result.additionalDeclarations.push(`
          type ${type} {
            "The external ID reference for this entity."
            id: ID!
          }
      `);
      }
    }

    return result;
  }

  protected transformType(property: ParserResult.Property): string {
    // NOTE: the GraphQL spec has a special 'ID' type, which it uses
    // to uniquely identify schema entities.
    if (property.name === 'id') {
      return 'ID';
    }
    return this.getGraphQLType(property.type);
  }

  private transformExtendingStructures(structure: ParserResult.Structure): string {
    const extendingStructures = this.getAllExtendingStructures(structure);
    if (extendingStructures.length > 0) {
      const declaration = extendingStructures
        .map((extendingStructure) => extendingStructure.name)
        .join(' & ');
      return ` implements ${declaration}`;
    } else {
      return '';
    }
  }
}
