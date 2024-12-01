import path from 'path';

import { Project } from 'ts-morph';

export const getProject = () => {
  const pathToMocks = path.resolve(__dirname, '../__mocks__');
  const project = new Project();
  project.addSourceFilesAtPaths(`${pathToMocks}/**/**.ts`);

  return project;
};
