import { SourceFileTransformerOpts } from '../types';

interface IdentifierTransformerImportOpts {
  /**
   * Name of the declaration to import.
   */
  name: string;
  /**
   * Path to the import (absolute).
   */
  path: string;
}

export interface IdentifierTransformerOpts extends SourceFileTransformerOpts {
  /**
   * The name of the structure which a structure needs to extend to be
   * reference-able using an ID.
   */
  mustExtendStructureOfName: string;
  /**
   * The import declarations for the base identifier class to be extended, and
   * the parser which exposes a `.parse` method.
   */
  imports: {
    /**
     * Location for the base class.
     */
    base: IdentifierTransformerImportOpts;
    /**
     * Location for the parser class.
     */
    parser: IdentifierTransformerImportOpts;
  };
}
