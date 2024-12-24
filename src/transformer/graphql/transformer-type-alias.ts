import { GraphQLBaseTransformer } from './base';
import { ParserResult } from '../../parser/types';

export class GraphQLTypeAliasTransformer extends GraphQLBaseTransformer {
  public transform(structure: ParserResult.Structure): string {
    if (structure.typeAliases && structure.typeAliases.length > 0) {
      return `
        "${structure.comment}"
        union ${structure.name} = ${structure.typeAliases
          .map(this.getGraphQLType.bind(this))
          .join(' | ')}
      `;
    }
    throw new Error(`Oops! Only type aliases declared as unions are supported 😱`);
  }
}
