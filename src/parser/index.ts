import { Node, SourceFile } from 'ts-morph';

import { EnumParser } from './parser-declaration-enum';
import { InterfaceParser } from './parser-declaration-interface';
import { TypeAliasParser } from './parser-declaration-type-alias';
import { ParserResult, SupportedDeclaration } from './types';
import { getExport, getExports } from './util';

export class DeclarationParser {
  private enumParser: EnumParser;
  private interfaceParser: InterfaceParser;
  private typeAliasParser: TypeAliasParser;

  public constructor() {
    this.enumParser = new EnumParser();
    this.interfaceParser = new InterfaceParser();
    this.typeAliasParser = new TypeAliasParser();
  }

  public parse(sourceFile: SourceFile): ParserResult.Structure | undefined {
    const exportDeclaration = getExport(sourceFile);
    return this.parseDeclaration(exportDeclaration);
  }

  public parseSafe(sourceFile: SourceFile): ParserResult.Structure | undefined {
    try {
      const exportDeclaration = getExport(sourceFile);
      return this.parseDeclaration(exportDeclaration);
    } catch (err) {
      return undefined;
    }
  }

  public parseAll(sourceFile: SourceFile): (ParserResult.Structure | undefined)[] {
    const exportDeclarations = getExports(sourceFile);
    return exportDeclarations.map((exportDeclaration) =>
      this.parseDeclaration(exportDeclaration),
    );
  }

  public parseDeclaration(
    declaration: SupportedDeclaration,
  ): ParserResult.Structure | undefined {
    if (Node.isEnumDeclaration(declaration)) {
      return this.enumParser.parse(declaration);
    }
    if (Node.isInterfaceDeclaration(declaration)) {
      return this.interfaceParser.parse(declaration);
    }
    if (Node.isTypeAliasDeclaration(declaration)) {
      return this.typeAliasParser.parse(declaration);
    }
  }
}

export { ParserResult } from './types';
