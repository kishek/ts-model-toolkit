import kebabCase from 'lodash.kebabcase';

import { GraphQLBaseTransformer } from './base';
import {
  GraphQLInputTypeParams,
  GraphQLResolver,
  GraphQLResolverResponse,
  GraphQLTransformerOpts,
  GraphQLTransformPropertyResult,
} from './types';
import { ParserResult } from '../../parser/types';
import path from 'path';

const resolverFallback = ['default-return-value', 'Boolean'] as const;

export class GraphQLInterfaceTransformer extends GraphQLBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ): string {
    const tags = structure.tags ?? [];

    if (tags.some((t) => t[0] === 'input')) {
      const inputType = this.transformInputType(structure, opts);
      return inputType.graphql;
    }
    return this.transformInterfaceToGraphQL(structure, opts);
  }

  public transformInputType(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ): GraphQLResolverResponse {
    const inputType = opts?.inputType ?? {
      type: 'query',
      inputNameTransformer: (n) => n,
    };
    const gql = this.transformInputToGraphQL(structure, opts, inputType);
    const resolver = this.transformInputToResolver(structure, inputType);

    if (resolver) {
      return { graphql: gql, resolver };
    } else {
      return { graphql: gql };
    }
  }

  private transformInterfaceToGraphQL(
    structure: ParserResult.Structure,
    opts: GraphQLTransformerOpts | undefined,
  ) {
    const keyword = structure.isBaseStructure ? 'interface' : 'type';
    const allProperties = this.getAllProperties(structure);
    const allPropertiesGraphQL = allProperties.map((prop) =>
      this.transformProperty(structure, prop, opts),
    );
    const directives = this.getDirectives(structure, allProperties, opts);
    const parents = this.transformExtendingStructures(structure);

    return `
      "${structure.comment}"
      ${keyword} ${structure.name}${parents}${directives} {
        ${allPropertiesGraphQL.map((prop) => prop.graphql).join('')}
      }
      ${allPropertiesGraphQL
        .map((prop) => prop.additionalDeclarations.join('\n'))
        .join('')}
    `;
  }

  public transformInputToGraphQL(
    structure: ParserResult.Structure,
    transformOpts: GraphQLTransformerOpts | undefined,
    opts: GraphQLInputTypeParams,
  ): string {
    const allProperties = this.getAllProperties(structure);
    const allPropertiesGraphQL = allProperties.map((prop) =>
      this.transformProperty(structure, prop, transformOpts),
    );

    const propertyDocuments = allPropertiesGraphQL.map((prop) => prop.graphql);
    const additionalDocuments = allPropertiesGraphQL
      .map((prop) => prop.additionalDeclarations)
      .flat();

    const inputName = opts.inputNameTransformer(structure.name);
    const input = `
      "${structure.comment}"
      input ${inputName} {
        ${propertyDocuments.join('')}
      }
      
      ${additionalDocuments.join('')}`;

    const schemaType = opts.type === 'query' ? 'Query' : 'Mutation';
    const resolver = this.getResolver(structure, opts);

    if (resolver) {
      return `
        ${input}
        
        type ${schemaType} {
          ${resolver}
        }
      `;
    } else {
      return input;
    }
  }

  public transformInputToResolver(
    input: ParserResult.Structure,
    opts: GraphQLInputTypeParams,
  ): GraphQLResolver | undefined {
    const resolver = this.getResolverInfo(input, opts);
    if (!resolver) {
      return;
    }

    if (!opts.resolver) {
      return;
    }

    const { dir, project, template } = opts.resolver;

    const target = path.resolve(dir, kebabCase(resolver.resolverName) + '.ts');
    const file = this.createFileReference(target, project);

    // NOTE: it is assumed the return value of the resolver is in the same file
    // as the file in which the input has been defined
    const sourceFile = project.getSourceFileOrThrow(input.path);

    this.addModelImport(input, file, {
      project,
      modelFile: sourceFile,
      outputPath: target,
    });
    this.addModelImport(
      input,
      file,
      {
        project,
        modelFile: sourceFile,
        outputPath: target,
      },
      resolver.resolverResult.item,
    );

    const returns = resolver.resolverResult;
    const result = returns.type === 'array' ? `${returns.item}[]` : returns.item;

    const body = template
      .replace(/RESOLVER_NAME/g, resolver.resolverName)
      .replace(/RESOLVER_INPUT_TYPE/g, input.name)
      .replace(/RESOLVER_RESULT/g, result);

    const text = file.getFullText();
    file.appendWhitespace('\n');
    file.insertText(text.length + 1, body);

    return {
      name: resolver.resolverName,
      type: opts.type,
      path: target,
      contents: file.getFullText(),
    };
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

  private getResolverInfo(
    structure: ParserResult.Structure,
    opts: GraphQLInputTypeParams,
  ) {
    if (!opts.resolverNameTransformer) {
      return;
    }

    const argName = opts.inputNameTransformer(structure.name);
    const resolverName = opts.resolverNameTransformer(structure.name);

    const resolverReturnValue =
      structure.tags?.find((t) => t[0] === 'returns') ?? resolverFallback;
    const resolverResult = resolverReturnValue[1];

    if (resolverResult.startsWith('[') && resolverResult.endsWith(']')) {
      const item = resolverResult.slice(1, -1);
      return { argName, resolverName, resolverResult: { type: 'array', item } as const };
    }

    return {
      argName,
      resolverName,
      resolverResult: { type: 'interface', item: resolverResult } as const,
    };
  }

  private getResolver(structure: ParserResult.Structure, opts: GraphQLInputTypeParams) {
    const info = this.getResolverInfo(structure, opts);
    if (!info) {
      return '';
    }

    const gqlType =
      info.resolverResult.type === 'array'
        ? `[${info.resolverResult.item}]`
        : info.resolverResult.item;

    return `${info.resolverName}(input: ${info.argName}!): ${gqlType}`;
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

    return this.getGraphQLType(property.type, property.tags);
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
