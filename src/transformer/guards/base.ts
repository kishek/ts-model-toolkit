import { FunctionDeclaration, SourceFile, SyntaxKind } from 'ts-morph';

import { GuardTransformerOpts } from './types';
import { Transformer } from '../';
import { ParserResult } from '../../parser/types';

export interface GetGuardOpts {
  type: ParserResult.Type;
  inputVariable?: string;
  imports: ParserResult.Import[];
  file: SourceFile;
  fileOriginal: SourceFile;
}

/**
 * Special checks done for the guard transformer only.
 */
export const GUARD_MAPPINGS: Record<string, (variable: string) => string> = {
  Date: (variable) => `${variable}.constructor.name === "Date"`,
  URL: (variable) => `${variable}.constructor.name === "URL"`,
};

export class GuardBaseTransformer extends Transformer {
  /**
   * A method which translates parser type representations to guard checks.
   * @param type
   */
  protected getGuard({
    type,
    inputVariable = 'entity',
    imports,
    file,
    fileOriginal,
  }: GetGuardOpts): string {
    const defaultOpts = { inputVariable, imports, file, fileOriginal };
    // All references to constituting type guards are handled here.
    const toGuardWithImport = (rawType = type) => {
      if (GUARD_MAPPINGS[rawType.raw]) {
        return GUARD_MAPPINGS[rawType.raw](inputVariable);
      }
      const fnName = `is${rawType.raw}`;
      // Add import to where the sub-guard comes from.
      this.addImport({
        importIdentifier: rawType.raw,
        importName: fnName,
        imports,
        file,
        importFormatter: this.formatImport,
        useEntrypoint: true,
      });
      return `${fnName}(${inputVariable})`;
    };

    // NOTE: if a type has been supplied, this means that the
    // current type needs to be overriden.
    if (type.suppliedValue) {
      return this.getGuard({ ...defaultOpts, type: type.suppliedValue });
    }

    switch (type.kind.value) {
      case SyntaxKind.StringKeyword:
        return `typeof ${inputVariable} === "string"`;
      case SyntaxKind.NumberKeyword:
        return `typeof ${inputVariable} === "number"`;
      case SyntaxKind.BooleanKeyword:
        return `typeof ${inputVariable} === "boolean"`;
      case SyntaxKind.Identifier: {
        if (type.defaultValue) {
          this.addImport({
            importIdentifier: type.raw,
            imports,
            file: fileOriginal,
            creatingFile: file,
            useDirectory: true,
          });
          return `${inputVariable} === ${type.raw}.${type.defaultValue.raw}`;
        }
      }
      case SyntaxKind.InterfaceDeclaration:
      case SyntaxKind.TypeReference: {
        const fallbackType = type.defaultValue || type.constraintValue;
        if (fallbackType) {
          const fnName = `is${type.raw}`;
          const fnNameFallback = `is${fallbackType.raw}`;

          this.addImport({
            importIdentifier: fallbackType.raw,
            importName: fnNameFallback,
            imports,
            file,
            importFormatter: this.formatImport,
            useEntrypoint: true,
          });

          return `(${fnName} || ${fnNameFallback})(${inputVariable})`;
        }
        if (type.typeArguments?.length === 1) {
          const typeArgument = type.typeArguments[0];
          const typeArgumentFnName = `is${typeArgument.raw}`;

          // Add imports for type argument and its associated guard.
          this.addImport({
            importIdentifier: typeArgument.raw,
            imports,
            file: fileOriginal,
            creatingFile: file,
            useDirectory: true,
          });
          this.addImport({
            importIdentifier: typeArgument.raw,
            importName: typeArgumentFnName,
            imports,
            file,
            importFormatter: this.formatImport,
            useEntrypoint: true,
          });
          // Add import for type guard and type guard for type parameter.
          toGuardWithImport(type);
          toGuardWithImport(typeArgument);
          // Construct a generic-aware guard statement.
          return `is${type.raw}<${typeArgument.raw}>(${inputVariable}, ${typeArgumentFnName})`;
        }

        return toGuardWithImport();
      }
      case SyntaxKind.ArrayType: {
        const elements = type.elements;
        if (elements) {
          const [element] = elements;
          return `Array.isArray(${inputVariable}) && ${inputVariable}.every((item: any) => ${this.getGuard(
            {
              ...defaultOpts,
              type: element,
              inputVariable: 'item',
            },
          )})`;
        }
      }
      case SyntaxKind.UnionType: {
        const elements = type.elements;
        if (elements) {
          return `(${elements
            .map((element) => this.getGuard({ ...defaultOpts, type: element }))
            .join(' || ')})`;
        }
      }
      case SyntaxKind.TupleType: {
        const elements = type.elements;
        if (elements && elements.length > 0) {
          const [maybeRequired, maybeRest] = elements;
          // NOTE: we enforce the guards for our tuple types based on what is 'required'
          // as an element of the tuple, and what the rest of the elements need to be.
          if (maybeRest && maybeRest.kind.value === SyntaxKind.RestType) {
            if (maybeRest.elements && maybeRest.elements.length > 0) {
              const restType = maybeRest.elements[0];
              const restGuard = this.getGuard({ ...defaultOpts, type: restType });
              const requiredGuard = this.getGuard({
                ...defaultOpts,
                type: maybeRequired,
                inputVariable: 'item',
              });
              return `Array.isArray(${inputVariable}) && ${restGuard} && ${inputVariable}.some(item => ${requiredGuard})`;
            }
          }
        }
      }
      default:
        console.warn(`Woah! ${type.kind.name} unsupported by Guard transformer 😱`);
        return 'false';
    }
  }
  /**
   * A method which returns a reference to a template file (for the purposes of generating type guard)
   * and the function in which the guard will live.
   */
  protected getTypeGuardReferences(
    structure: ParserResult.Structure,
    opts: GuardTransformerOpts,
    originalFileRef: SourceFile,
  ) {
    const fileRef = this.getFileRef(opts);
    const imports = this.getAllImports(structure);

    const typeParameters = this.getTypeParameters(
      structure,
      imports,
      fileRef,
      originalFileRef,
    );
    const typeParametersInReturn = typeParameters.map((t) => t.name).join(', ');

    const functionRef = fileRef.addFunction({
      name: `is${structure.name}`,
      isExported: true,
      typeParameters,
      returnType: `entity is ${structure.name}${
        typeParametersInReturn ? `<${typeParametersInReturn}>` : ''
      }`,
      parameters: [
        {
          name: 'entity',
          type: 'any',
        },
      ],
    });

    // NOTE: Add a parameter for a guard which is passed to 'generic' guards. This is to ensure that
    // we check the top-level type when extending a generic type, rather than the base-level, as we
    // may miss a whole host of properties when performing this check.
    // ------------------------------------------------
    // We only support this for cases where there is *one* type parameter at the moment.
    if (typeParameters.length === 1) {
      const typeParameterName = typeParameters[0].name;
      functionRef.addParameter({
        name: `is${typeParameterName}`,
        type: `(entity: any) => entity is ${typeParameterName}`,
        hasQuestionToken: true,
        leadingTrivia: '// eslint-disable-next-line @typescript-eslint/no-unused-vars',
      });
    }
    if (typeParameters.length > 1) {
      console.warn(
        `Oh no! Received ${typeParameters.length} type parameters for ${structure.name} 🙀 This is not supported by the 'guards' transformer in \`ts-model-toolkit\` at the moment.`,
      );
    }

    return {
      fileRef,
      functionRef,
      imports,
    };
  }

  /**
   * A method which places the predicates for a type guard into a well-structured code block
   * inside of the function reference.
   */
  protected addFunctionBody(functionRef: FunctionDeclaration, guard: string): void {
    functionRef.setBodyText((writer) => {
      const guardStatement = guard.length > 0 ? `&& (${guard})` : '';
      writer.writeLine(`if (entity ${guardStatement})`).block(() => {
        writer.writeLine('return true;');
      });
      writer.writeLine('return false;');
    });
  }

  /**
   * An import formatter used by default by the guard transformer.
   */
  protected formatImport(importDef: ParserResult.Import): string {
    if (importDef.path.startsWith('@')) {
      return importDef.path + '/guards';
    }

    return importDef.path + '.guard';
  }
}
