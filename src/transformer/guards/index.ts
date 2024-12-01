import { GuardEnumTransformer } from './transformer-enum';
import { GuardInterfaceTransformer } from './transformer-interface';
import { GuardTypeAliasTransformer } from './transformer-type-alias';
import { GuardTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export class GuardTransformer extends Transformer {
  private enumTransformer: Transformer;
  private typeAliasTransformer: Transformer;
  private interfaceTransformer: Transformer;

  public constructor() {
    super();
    this.enumTransformer = new GuardEnumTransformer();
    this.typeAliasTransformer = new GuardTypeAliasTransformer();
    this.interfaceTransformer = new GuardInterfaceTransformer();
  }

  public transform(
    structure: ParserResult.Structure,
    opts?: GuardTransformerOpts,
  ): string {
    switch (structure.type) {
      case ParserResult.StructureType.ENUM:
        return this.enumTransformer.transform(structure, opts);
      case ParserResult.StructureType.TYPE_ALIAS:
        return this.typeAliasTransformer.transform(structure, opts);
      case ParserResult.StructureType.INTERFACE:
        return this.interfaceTransformer.transform(structure, opts);
    }
  }
}
