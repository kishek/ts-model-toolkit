import { GraphQLEnumTransformer } from './transformer-enum';
import { GraphQLInterfaceTransformer } from './transformer-interface';
import { GraphQLInterfaceRelayTransformer } from './transformer-interface-relay';
import { GraphQLTypeAliasTransformer } from './transformer-type-alias';
import { GraphQLTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export class GraphQLTransformer extends Transformer {
  private enumTransformer: Transformer;
  private typeAliasTransformer: Transformer;
  private interfaceTransformer: Transformer;
  private interfaceTransformerRelay: Transformer;

  public constructor() {
    super();
    this.enumTransformer = new GraphQLEnumTransformer();
    this.typeAliasTransformer = new GraphQLTypeAliasTransformer();
    this.interfaceTransformer = new GraphQLInterfaceTransformer();
    this.interfaceTransformerRelay = new GraphQLInterfaceRelayTransformer();
  }

  public transform(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ): string {
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
}
