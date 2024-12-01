import { BuilderInterfaceTransformer } from './transformer-interface';
import { BuilderTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export class BuilderTransformer extends Transformer {
  private interfaceTransformer: Transformer;

  public constructor() {
    super();
    this.interfaceTransformer = new BuilderInterfaceTransformer();
  }

  public transform(
    structure: ParserResult.Structure,
    opts?: BuilderTransformerOpts,
  ): string {
    switch (structure.type) {
      case ParserResult.StructureType.INTERFACE:
        return this.interfaceTransformer.transform(structure, opts);
      default:
        throw new Error(
          `Oops! Auto-generated builders not supported for entity of type ${structure.type}`,
        );
    }
  }
}
