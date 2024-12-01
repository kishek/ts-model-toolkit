import { GuardBaseTransformer } from './base';
import { GuardTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

export class GuardEnumTransformer extends GuardBaseTransformer {
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

    // Create guards for each member of the enum.
    const membersGuard = structure.properties
      .map((property) => `entity === ${structure.name}.${property.name}`)
      .join(' || ');

    this.addFunctionBody(functionRef, membersGuard);
    this.addModelImport(structure, fileRef, opts);

    return fileRef.getFullText();
  }
}
