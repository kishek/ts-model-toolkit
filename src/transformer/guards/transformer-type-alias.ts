import { GuardBaseTransformer } from './base';
import { GuardTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

export class GuardTypeAliasTransformer extends GuardBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts: GuardTransformerOpts,
  ): string {
    const originalFileRef = opts.project.getSourceFileOrThrow(structure.path);
    const { fileRef, functionRef } = this.getTypeGuardReferences(
      structure,
      opts,
      originalFileRef,
    );

    if (structure.typeAliases && structure.typeAliases.length > 0) {
      const propertiesGuard = structure.typeAliases
        .map((typeAlias) =>
          this.getGuard({
            type: typeAlias,
            imports: structure.imports,
            file: fileRef,
            fileOriginal: originalFileRef,
          }),
        )
        .join(' || ');

      this.addFunctionBody(functionRef, propertiesGuard);
      this.addModelImport(structure, fileRef, opts);

      return fileRef.getFullText();
    }

    throw new Error(`Oh no! No type alias declarations present 😱`);
  }
}
