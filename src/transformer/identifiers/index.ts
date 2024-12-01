import { IdentifierInterfaceTransformer } from './transformer-interface';
import { IdentifierTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export class IdentifierTransformer extends Transformer<
  string,
  IdentifierTransformerOpts
> {
  private interfaceTransformer: Transformer;

  public constructor() {
    super();
    this.interfaceTransformer = new IdentifierInterfaceTransformer();
  }

  public transform(
    structure: ParserResult.Structure,
    opts?: IdentifierTransformerOpts,
  ): string {
    switch (structure.type) {
      case ParserResult.StructureType.INTERFACE:
        return this.interfaceTransformer.transform(structure, opts);
      default:
        throw new Error(
          `Oops! Auto-generated identifiers not supported for entity of type ${structure.type}`,
        );
    }
  }
}
