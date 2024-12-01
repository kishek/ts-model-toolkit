import { Scope } from 'ts-morph';

import { IdentifierTransformerOpts } from './types';
import { Transformer } from '..';
import { ParserResult } from '../../parser/types';

export class IdentifierInterfaceTransformer extends Transformer {
  public transform(
    structure: ParserResult.Structure,
    opts: IdentifierTransformerOpts,
  ): string {
    const parents = this.getAllExtendingStructures(structure);
    if (parents.some((parent) => parent.name === opts.mustExtendStructureOfName)) {
      const nameAsCamelCase =
        structure.name.charAt(0).toLowerCase() +
        structure.name.slice(1, structure.name.length);
      const identifierFileRef = this.getFileRef(opts);

      // Add imports to base class + parser.
      const { base, parser } = opts.imports;
      identifierFileRef.addImportDeclaration({
        namedImports: [base.name, parser.name],
        moduleSpecifier: base.path,
      });

      // Create class.
      const identifierClassName = `${structure.name}Identifier`;
      identifierFileRef.addClass({
        name: identifierClassName,
        isExported: true,
        extends: `BaseIdentifier<'${nameAsCamelCase}'>`,
        methods: [
          {
            name: 'create',
            scope: Scope.Public,
            isStatic: true,
            parameters: [
              {
                name: 'id',
                type: 'string',
              },
            ],
            statements: (writer) =>
              writer.write(`
                const uuid = id;
                return new ${identifierClassName}('${nameAsCamelCase}', uuid);
              `),
            returnType: identifierClassName,
          },
          {
            name: 'parse',
            scope: Scope.Public,
            isStatic: true,
            parameters: [
              {
                name: 'id',
                type: 'string',
              },
            ],
            statements: (writer) =>
              writer.write(`
                const uuid = Parser.id(id);
                return new ${identifierClassName}('${nameAsCamelCase}', uuid);
              `),
            returnType: identifierClassName,
          },
        ],
      });

      identifierFileRef.formatText();
      return identifierFileRef.getFullText();
    }
    // Return empty string for non-conformant entities.
    return '';
  }
}
