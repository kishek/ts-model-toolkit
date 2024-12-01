import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export class GraphQLEnumTransformer extends Transformer {
  public transform(structure: ParserResult.Structure): string {
    return `
      "${structure.comment}"
      enum ${structure.name} {
        ${structure.properties.map(this.transformProperty).join('')}
      }
    `;
  }

  private transformProperty(property: ParserResult.Property): string {
    return `
        "${property.comment}"
        ${property.name}
    `;
  }
}
