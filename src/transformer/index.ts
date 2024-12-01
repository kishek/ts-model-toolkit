import path from 'path';

import flattenDeep from 'lodash.flattendeep';
import { OptionalKind, SourceFile, TypeParameterDeclarationStructure } from 'ts-morph';

import { GuardTransformerOpts } from './guards/types';
import { AddImportOpts, SourceFileTransformerOpts } from './types';
import { ParserResult } from '../parser/types';

/**
 * Defines the core transformer contract. A transformer must take the result from
 * a parser, and produce a particular result. This result can then be used to write to files,
 * or perform in-memory processing (most use-cases will produce strings).
 */
export abstract class Transformer<
  TransformerResult = string,
  TransformerOpts = Record<string, unknown>,
> {
  /**
   * The core method of the transformer, which translates from a ParserResult to a
   * a particular result foramt.
   */
  public transform(
    _structure: ParserResult.Structure,
    _opts?: TransformerOpts,
  ): TransformerResult {
    throw new Error('Transformer.transform needs implementation!');
  }

  /**
   * The core method of the transformer, which translates from a ParserResult to a
   * a particular result foramt.
   */
  public transformSafe(
    structure: ParserResult.Structure,
    opts?: TransformerOpts,
  ): TransformerResult | undefined {
    try {
      return this.transform(structure, opts);
    } catch (err) {
      return undefined;
    }
  }

  /**
   * A method which computes all properties for a structure, including from its parent
   * structures. Used to pull in all properties for advanced use-cases.
   * @param structure
   */
  protected getAllProperties(structure: ParserResult.Structure): ParserResult.Property[] {
    const parentProperties = flattenDeep(
      structure.extendingStructures.map((parent) => {
        // NOTE: we omit all properties part of the parent which are overriden
        // in the child structure. This allows for such overrides to be respected.
        const propertiesUniqueToParent = parent.properties.filter(
          (property) =>
            !structure.properties.some(
              (propertyFromChild) => propertyFromChild.name === property.name,
            ),
        );
        return this.getAllProperties({
          ...parent,
          properties: propertiesUniqueToParent,
        });
      }),
    );
    // Return all properties, placing child properties at the end.
    return parentProperties.concat(structure.properties);
  }

  /**
   * A method which computes all extending structures for a structure, including from its parent
   * structures. Used to pull in entire hierarchy for advanced use-cases.
   * @param structure
   */
  protected getAllExtendingStructures(
    structure: ParserResult.Structure,
  ): ParserResult.Structure[] {
    const parentStructures = flattenDeep(
      structure.extendingStructures.map((parent) => {
        return this.getAllExtendingStructures(parent);
      }),
    );
    // Return all properties, placing child properties at the end.
    return parentStructures.concat(structure.extendingStructures);
  }

  /**
   * A method which computes all imports for a structure, including from its parent
   * structures. Used to pull in all imports for advanced use-cases.
   * @param structure
   */
  protected getAllImports(structure: ParserResult.Structure): ParserResult.Import[] {
    const parentImports = flattenDeep(
      structure.extendingStructures.map((parent) => {
        // NOTE: we omit all imports part of the parent which are already included
        // in the child structure. This avoids duplication.
        const parentImport = structure.imports.find(
          (importDef) => importDef.name === parent.name,
        );
        const parentImports = parent.imports.filter(
          (parentImport) =>
            !structure.imports.some(
              (childImport) => childImport.name === parentImport.name,
            ),
        );
        // NOTE: if the parent is from a different bounded context and the imports it refers to are from
        // the same one, we should be pointing the current file to the same bounded context.
        if (parentImport && this.checkImportFromOtherContext(parentImport)) {
          return this.getAllImports({
            ...parent,
            imports: parentImports.map((importFromParent) => ({
              name: importFromParent.name,
              path: this.checkImportFromOtherContext(importFromParent)
                ? path.resolve(parent.path, importFromParent.path)
                : parentImport.path,
            })),
          });
        }

        return this.getAllImports({
          ...parent,
          imports: parentImports.map((importFromParent) => {
            if (this.checkImportFromOtherContext(importFromParent)) {
              return importFromParent;
            }

            const absolutePath = path.resolve(
              path.dirname(parent.path),
              importFromParent.path,
            );
            return { ...importFromParent, path: absolutePath };
          }),
        });
      }),
    );
    // Return all imports, placing child imports at the end.
    return parentImports.concat(structure.imports);
  }

  protected getTypeParameters(
    structure: ParserResult.Structure,
    imports?: ParserResult.Import[],
    fileRef?: SourceFile,
    originalFileRef?: SourceFile,
  ): OptionalKind<TypeParameterDeclarationStructure>[] {
    const typeParameters =
      structure.typeParameters?.map((typeParameter) => ({
        name: typeParameter.raw,
        constraint: typeParameter.constraintValue?.raw,
        default: typeParameter.defaultValue?.raw,
      })) ?? [];
    if (imports && fileRef) {
      typeParameters.forEach((typeParameter) => {
        const opts = {
          imports,
          file: originalFileRef ?? fileRef,
          useDirectory: Boolean(originalFileRef),
          creatingFile: fileRef,
        };
        this.addImport({
          importIdentifier: typeParameter.name,
          importName: typeParameter.name,
          ...opts,
        });

        if (typeParameter.default && typeof typeParameter.default === 'string') {
          this.addImport({
            importIdentifier: typeParameter.default,
            importName: typeParameter.default,
            ...opts,
          });
        }
        if (typeParameter.constraint && typeof typeParameter.constraint === 'string') {
          this.addImport({
            importIdentifier: typeParameter.constraint,
            importName: typeParameter.constraint,
            ...opts,
          });
        }
      });
    }
    return typeParameters;
  }

  /**
   * Gets a source file reference for the purposes of generating code.
   */
  protected getFileRef(opts: GuardTransformerOpts): SourceFile {
    const randomSuffix = `.generated.${Date.now()}.ts`;
    return opts.project.createSourceFile(opts.outputPath.replace('.ts', randomSuffix));
  }

  /** */
  protected checkImportFromOtherContext(importDef?: ParserResult.Import): boolean {
    return !!importDef?.path.startsWith('@');
  }
  /**
   * A method which checks if an import is part of a file already.
   */
  protected checkImportExists(name: string, fileRef: SourceFile): boolean {
    return !!fileRef.getImportDeclaration((declaration) =>
      declaration.getNamedImports().some((namedImport) => namedImport.getName() === name),
    );
  }

  /**
   * A method which adds a final import to the original model file for which this type guard is being
   * generated. The path to the import is based off the options provided to the GuardTransformer.
   */
  protected addModelImport(
    structure: ParserResult.Structure,
    fileRef: SourceFile,
    opts: SourceFileTransformerOpts,
  ): void {
    if (!this.checkImportExists(structure.name, fileRef)) {
      const pathToModelFile = path
        .relative(opts.outputPath, opts.modelFile.getFilePath())
        .replace('..', '.');
      fileRef.addImportDeclaration({
        namedImports: [structure.name],
        moduleSpecifier: pathToModelFile.replace('.ts', ''),
      });
    }
  }

  /**
   * A method which adds an import relative to the original file.
   */
  protected addRelativeImport(
    fileRef: SourceFile,
    importName: string,
    importPath: string,
  ): void {
    const pathToFile = fileRef.getSourceFile().getFilePath();
    const pathToImportRelative = path.relative(pathToFile, importPath).replace('..', '.');
    fileRef.addImportDeclaration({
      namedImports: [importName],
      moduleSpecifier: pathToImportRelative.replace('.ts', ''),
    });
  }

  /**
   * A method which adds any necessary imports from either relative imports or other packages.
   */
  protected addImport({
    file,
    creatingFile,
    importIdentifier,
    importName = importIdentifier,
    imports,
    useDirectory = false,
    useEntrypoint = false,
    importFormatter,
    debug,
  }: AddImportOpts): void {
    const importDef = imports.find((importDef) => importDef.name === importIdentifier);
    if (importDef) {
      const target = creatingFile ?? file;
      let importModuleSpecifier: string;

      if (importDef.path.startsWith('@')) {
        importModuleSpecifier =
          useEntrypoint && importFormatter ? importFormatter(importDef) : importDef.path;
      } else if (importFormatter) {
        importModuleSpecifier = importFormatter(importDef);
      } else {
        importModuleSpecifier = this.getImportPath(
          file,
          target,
          importDef,
          useDirectory,
          debug,
        ).replace(/'/g, '');
      }

      if (!this.checkImportExists(importName, target)) {
        if (debug) {
          console.log(importName, 'added to', target.getFilePath());
        }
        target.addImportDeclaration({
          namedImports: [importName],
          moduleSpecifier: importModuleSpecifier,
        });
      } else if (debug) {
        console.log(importName, 'exists!');
      }
    }
  }

  /**
   * Gets the path to an import either by looking it up in the project, or by using it's raw path.
   */
  private getImportPath(
    file: SourceFile,
    target: SourceFile,
    importMapping: ParserResult.Import,
    useDirectory: boolean,
    debug = false,
  ): string {
    const filePath = file.getFilePath();
    const fileReference = useDirectory ? path.dirname(filePath) : filePath;

    const importAbsolutePath = path.resolve(fileReference, importMapping.path);
    const importSourceFile = file.getProject().getSourceFile(`${importAbsolutePath}.ts`);

    if (debug) {
      console.log({
        from: fileReference,
        relative: importMapping.path,
        absolute: importAbsolutePath,
      });
    }

    if (importSourceFile) {
      const relativePath = path.relative(
        target.getFilePath(),
        importSourceFile.getFilePath(),
      );
      return relativePath.replace('..', '.').replace('.ts', '');
    } else {
      return importMapping.path;
    }
  }

  /**
   * Gets the import for a property, given an inferred, final 'type'.
   */
  protected getImportForProperty(property: ParserResult.Property, type: string) {
    return property.imports?.find((importStatement) => importStatement.name === type);
  }
}
