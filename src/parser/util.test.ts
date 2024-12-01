import { Project, SourceFile } from 'ts-morph';

import { getExport } from './util';

describe('getExport()', () => {
  let file: SourceFile;

  beforeEach(() => {
    file = new Project().createSourceFile('parser.getExport.test.ts');
  });

  it('throws error when more than one export is present', () => {
    // Add a legitimate export for an interface first to the file.
    file.addInterface({ name: 'TestInterface', isExported: true });
    file.addInterface({ name: 'TestInterfaceTwo', isExported: true });

    expect(() => getExport(file)).toThrowErrorMatchingInlineSnapshot(
      `"More than one export encountered in /test-rootundefined! Unsupported by \`ts-model-toolkit\`."`,
    );
  });

  it('throws error when an unsupported export is present', () => {
    // Add a legitimate export for an interface first to the file.
    file.addClass({ name: 'TestClass', isExported: true });

    expect(() => getExport(file)).toThrowErrorMatchingInlineSnapshot(
      `"Export declaration with kind ClassDeclaration not supported."`,
    );
  });

  it('extracts singular export when it is present and supported', () => {
    // Add a legitimate export for an interface first to the file.
    file.addInterface({ name: 'TestInterface', isExported: true });

    const exportDeclaration = getExport(file);
    expect(exportDeclaration).toBeDefined();
    expect(exportDeclaration.getName()).toBe('TestInterface');
  });
});
