import { Project, SourceFile } from 'ts-morph';

import { ParserResult } from '../parser/types';

export interface AddImportOpts {
  importIdentifier: string;
  importName?: string;
  imports: ParserResult.Import[];
  file: SourceFile;
  creatingFile?: SourceFile;
  importFormatter?: (importDef: ParserResult.Import) => string;
  useDirectory?: boolean;
  useEntrypoint?: boolean;
  debug?: boolean;
}

export interface SourceFileTransformerOpts extends Record<string, unknown> {
  /**
   * The project in which the model file lives. This is needed in order to secure imports
   * correctly for the file.
   */
  project: Project;
  /**
   * The source file for the import statement.
   */
  modelFile: SourceFile;
  /**
   * The output path for the file the import statement is being added to.
   */
  outputPath: string;
}
