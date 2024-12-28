import { GraphQLBaseTransformer } from './base';
import { ParserResult } from '../../parser/types';
import { GraphQLTransformerOpts } from './types';

export class GraphQLTypeAliasTransformer extends GraphQLBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts?: GraphQLTransformerOpts,
  ): string {
    if (structure.typeAliases && structure.typeAliases.length > 0) {
      return `
        "${structure.comment}"
        union ${structure.name} = ${structure.typeAliases
          .map((s) => this.getGraphQLType(s))
          .join(' | ')}
      `;
    }
    throw new Error(`Oops! Only type aliases declared as unions are supported 😱`);
  }
}
