import path from 'path';

import flattenDeep from 'lodash.flattendeep';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';

import { ParserResult, SupportedDeclaration } from './types';

export const getExport = (sourceFile: SourceFile): SupportedDeclaration => {
  const exportDeclarations = flattenDeep(
    Array.from(sourceFile.getExportedDeclarations().values()),
  );
  if (exportDeclarations.length > 1) {
    throw new Error(
      `More than one export encountered in ${sanitizePath(
        sourceFile.getFilePath(),
      )}! Unsupported by \`ts-model-toolkit\`.`,
    );
  }
  const exportDeclaration = exportDeclarations[0];
  if (
    Node.isEnumDeclaration(exportDeclaration) ||
    Node.isInterfaceDeclaration(exportDeclaration) ||
    Node.isTypeAliasDeclaration(exportDeclaration)
  ) {
    return exportDeclaration;
  } else {
    const kind = SyntaxKind[exportDeclaration.getKind()];
    throw new Error(`Export declaration with kind ${kind} not supported.`);
  }
};

export const getExports = (sourceFile: SourceFile): SupportedDeclaration[] => {
  const exportDeclarations = flattenDeep(
    Array.from(sourceFile.getExportedDeclarations().values()),
  );
  return exportDeclarations.filter(
    (exportDeclaration) =>
      Node.isEnumDeclaration(exportDeclaration) ||
      Node.isInterfaceDeclaration(exportDeclaration) ||
      Node.isTypeAliasDeclaration(exportDeclaration),
  ) as SupportedDeclaration[];
};

export const getImportForType = (
  type: ParserResult.Type,
  imports: ParserResult.Import[],
): ParserResult.Import | undefined => {
  return imports.find((declaration) => declaration.name === type.raw);
};

export const getImportRelativeToSourceFile = (
  importDeclaredAt: string,
  importStructure: ParserResult.Import | undefined,
) => {
  if (importStructure) {
    return path.resolve(importDeclaredAt, '../', importStructure.path);
  }
  return undefined;
};

/**
 * Use for testing purposes.
 * @param path
 * @returns
 */
export const sanitizePath = (path: string) => {
  if (process.env.NODE_ENV === 'test') {
    const [, filePath] = path.split('ts-model-toolkit');
    return `/test-root${filePath}`;
  }

  return path;
};

export const sanitizeType = (type: ParserResult.Type): ParserResult.Type => {
  if (process.env.NODE_ENV === 'test') {
    return {
      ...type,
      constraintValue: {
        ...type.constraintValue,
        path: type.constraintValue?.path
          ? sanitizePath(type.constraintValue.path)
          : undefined,
      },
      defaultValue: {
        ...type.defaultValue,
        path: type.defaultValue?.path ? sanitizePath(type.defaultValue.path) : undefined,
      },
      suppliedValue: {
        ...type.suppliedValue,
        path: type.suppliedValue?.path
          ? sanitizePath(type.suppliedValue.path)
          : undefined,
      },
      elements: type.elements ? type.elements.map(sanitizeType) : undefined,
      typeArguments: type.typeArguments
        ? type.typeArguments.map(sanitizeType)
        : undefined,
      path: type.path ? sanitizePath(type.path) : undefined,
    } as ParserResult.Type;
  }
  return type;
};
