import { GraphQLEnumTransformer } from './transformer-enum';
import { GraphQLInterfaceTransformer } from './transformer-interface';
import { GraphQLInterfaceRelayTransformer } from './transformer-interface-relay';
import { GraphQLTypeAliasTransformer } from './transformer-type-alias';
import {
  GraphQLResolver,
  GraphQLResolverTransformerOpts,
  GraphQLTransformerOpts,
} from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';
import { transformResolvers } from './transformer-resolvers';

export class GraphQLTransformer extends Transformer {
  private enumTransformer: GraphQLEnumTransformer;
  private typeAliasTransformer: GraphQLTypeAliasTransformer;
  private interfaceTransformer: GraphQLInterfaceTransformer;
  private interfaceTransformerRelay: GraphQLInterfaceRelayTransformer;

  public constructor() {
    super();
    this.enumTransformer = new GraphQLEnumTransformer();
    this.typeAliasTransformer = new GraphQLTypeAliasTransformer();
    this.interfaceTransformer = new GraphQLInterfaceTransformer();
    this.interfaceTransformerRelay = new GraphQLInterfaceRelayTransformer();
  }

  public transform(structure: ParserResult.Structure, opts?: GraphQLTransformerOpts) {
    switch (structure.type) {
      case ParserResult.StructureType.ENUM:
        return this.enumTransformer.transform(structure, opts);
      case ParserResult.StructureType.TYPE_ALIAS:
        return this.typeAliasTransformer.transform(structure, opts);
      case ParserResult.StructureType.INTERFACE: {
        if (opts?.useRelayConnectionSpecification) {
          return this.interfaceTransformerRelay.transform(structure, opts);
        } else {
          return this.interfaceTransformer.transform(structure, opts);
        }
      }
    }
  }

  public transformInput(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ) {
    if (structure.type !== ParserResult.StructureType.INTERFACE) {
      throw new Error('Only interfaces can be transformed to input types');
    }

    return this.interfaceTransformer.transformInputType(structure, opts);
  }

  public transformResolvers(
    resolvers: GraphQLResolver[],
    opts: GraphQLResolverTransformerOpts,
  ) {
    return transformResolvers(resolvers, opts);
  }
}
