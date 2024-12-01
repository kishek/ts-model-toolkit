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
   * The model file for which a guard will be created.
   */
  modelFile: SourceFile;
  /**
   * The output path for the type guard. This is where the file will be written to.
   */
  outputPath: string;
}
