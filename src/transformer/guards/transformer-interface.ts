import { GuardBaseTransformer } from './base';
import { GuardTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

export class GuardInterfaceTransformer extends GuardBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts: GuardTransformerOpts,
  ): string {
    const originalFileRef = opts.project.getSourceFileOrThrow(structure.path);
    const { fileRef, functionRef, imports } = this.getTypeGuardReferences(
      structure,
      opts,
      originalFileRef,
    );
    const propertyGuards: string[] = [];

    structure.properties.forEach((property) => {
      const guard = this.getGuard({
        type: property.type,
        imports,
        inputVariable: `entity.${property.name}`,
        file: fileRef,
        fileOriginal: originalFileRef,
      });
      if (property.isRequired) {
        propertyGuards.push(guard);
      } else {
        propertyGuards.push(`(!entity.${property.name} || (${guard}))`);
      }
    });

    const extendsGuard = structure.extendingStructures.map((extendingStructure) => {
      const fnName = `is${extendingStructure.name}`;
      this.addImport({
        importIdentifier: extendingStructure.name,
        importName: fnName,
        imports,
        file: fileRef,
        importFormatter: this.formatImport,
        useEntrypoint: true,
      });

      const hasTypeParameters = extendingStructure.typeParameters?.length === 1;
      const hasTypeParametersInChild = structure.typeParameters?.length === 1;
      // NOTE: we correlate type parameters from the parent and child hierarchy.
      // I.e. we take the type parameters which the child sets up for the parent.
      if (hasTypeParameters && hasTypeParametersInChild) {
        const typeParameter = structure.typeParameters?.[0];
        return `${fnName}(entity, is${typeParameter?.raw})`;
      }
      return `${fnName}(entity)`;
    });
    const guard = propertyGuards.concat(extendsGuard).join(' && ');

    this.addFunctionBody(functionRef, guard);
    this.addModelImport(structure, fileRef, opts);

    return fileRef.getFullText();
  }
}
