import path from 'path';

import {
  MethodDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  SyntaxKind,
} from 'ts-morph';

import { BuilderBaseTransformer } from './base';
import { BuilderTransformerOpts } from './types';
import { ParserResult } from '../../parser/types';

export class BuilderInterfaceTransformer extends BuilderBaseTransformer {
  public transform(
    structure: ParserResult.Structure,
    opts: BuilderTransformerOpts,
  ): string {
    const fileRef = this.getFileRef(opts);

    const typeParameters = this.getTypeParameters(structure);
    const typeParametersClause = typeParameters
      .map((typeParameter) => typeParameter.name)
      .join(',');
    const properties = this.getAllProperties(structure);
    const imports = this.getAllImports(structure).map((sourceImport) => {
      if (sourceImport.path.startsWith('@')) {
        return sourceImport;
      }

      const sourceFilePath = path.resolve(
        path.dirname(structure.path),
        sourceImport.path,
      );

      return {
        ...sourceImport,
        path: path.relative(fileRef.getFilePath(), sourceFilePath),
      };
    });

    const heritageClause = this.getHeritageClause(structure, typeParametersClause);
    const nameWithTypeParameters = typeParameters.length
      ? `${structure.name}<${typeParametersClause}>`
      : structure.name;

    const builderName = `${structure.name}Builder`;
    const builderRef = fileRef.addClass({
      name: builderName,
      typeParameters: this.getTypeParameters(structure, imports, fileRef),
      implements: [heritageClause],
      isExported: true,
    });

    const fields: OptionalKind<PropertyDeclarationStructure>[] = [];
    const methods: OptionalKind<MethodDeclarationStructure>[] = [];

    // We collect the fields, methods and imports in order first. We subsequently add
    // them to the builder class, otherwise they are added one after the other.
    properties.forEach((property) => {
      const name = property.name;
      const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1, name.length);
      const type = this.getPropertyType(
        property.type,
        imports,
        fileRef,
        structure.typeParameters,
      );
      if (!type.includes('.')) {
        methods.push({
          name: `with${nameCapitalized}`,
          parameters: [{ name: 'value', type }],
          returnType: `this & Pick<${structure.name}, '${name}'>`,
          statements: [`return Object.assign(this, { ${name}: value })`],
        });
        fields.push({ name, type, hasQuestionToken: true, isReadonly: true });
      } else {
        fields.push({
          name,
          type,
          hasQuestionToken: false,
          isReadonly: true,
          initializer: type,
        });
      }
    });

    // Add all constituents to the class.
    builderRef.addProperties(fields);
    builderRef.addMethods(methods);
    builderRef.addMethod({
      name: 'build',
      parameters: [
        {
          name: 'this',
          type: nameWithTypeParameters,
        },
      ],
      returnType: nameWithTypeParameters,
      statements: [this.getPropertiesAsStatements(properties)],
    });

    // Add an import to the model for which the builder is being created.
    this.addModelImport(structure, fileRef, opts);

    return fileRef.getFullText();
  }

  private getHeritageClause(
    structure: ParserResult.Structure,
    typeParametersClause: string,
  ) {
    if (typeParametersClause.length > 0) {
      return `Partial<${structure.name}<${typeParametersClause}>>`;
    }
    return `Partial<${structure.name}>`;
  }

  private getPropertiesAsStatements(properties: ParserResult.Property[]): string {
    return `return {\n${properties
      .map((prop) => {
        if (prop.type.kind.value === SyntaxKind.Identifier) {
          return `\t\t${prop.name}: ${prop.type.raw}.${prop.type.defaultValue?.raw}`;
        }
        return `\t\t${prop.name}: this.${prop.name}`;
      })
      .join(',\n')}\n};`;
  }
}
