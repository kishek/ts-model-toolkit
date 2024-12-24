import path from 'path';
import { GraphQLResolver, GraphQLResolverTransformerOpts } from './types';
import { ImportDeclarationStructure, Node, OptionalKind } from 'ts-morph';

const emptyDoc = `
export const resolvers = {
  Query: {},
  Mutation: {},
};
`;

export const transformResolvers = async (
  resolvers: GraphQLResolver[],
  { target, project }: GraphQLResolverTransformerOpts,
) => {
  // include any recently generated resolvers
  const dir = path.dirname(target);
  project.addDirectoryAtPathIfExists(dir);

  const file = project.getSourceFile(target) ?? project.createSourceFile(target);
  if (file.getFullText().trim().length === 0) {
    file.insertText(0, emptyDoc);
  }

  const descendants = file.getDescendants();

  const propertyAssignments = descendants.filter((descendant) =>
    Node.isPropertyAssignment(descendant),
  );
  const queryAssignment = propertyAssignments.find((assignment) => {
    const [name] = assignment.getChildren();
    return name.getText() === 'Query';
  });
  const mutationAssignment = propertyAssignments.find((assignment) => {
    const [name] = assignment.getChildren();
    return name.getText() === 'Mutation';
  });

  if (!queryAssignment) {
    return;
  }
  if (!mutationAssignment) {
    return;
  }

  const queries = resolvers.filter((r) => r.type === 'query');
  const mutations = resolvers.filter((r) => r.type === 'mutation');

  queryAssignment.replaceWithText(`Query: { ${queries.map((q) => q.name).join(',')} }`);
  mutationAssignment.replaceWithText(
    `Mutation: { ${mutations.map((q) => q.name).join(',')} }`,
  );

  const imports = resolvers.map((r): OptionalKind<ImportDeclarationStructure> => {
    const moduleName = path.basename(r.path);
    const moduleSpecifier = project.getSourceFile(moduleName);

    if (!moduleSpecifier) {
      return {
        namedImports: [r.name],
        moduleSpecifier: r.path,
      };
    }

    const relativePath = path.relative(file.getFilePath(), moduleSpecifier.getFilePath());
    const relativePathNormalized = relativePath.replace('..', '.').replace('.ts', '');

    return {
      namedImports: [r.name],
      moduleSpecifier: relativePathNormalized,
    };
  });

  const existingImports = file.getImportDeclarations();
  const unexistingImports = imports.filter((importDeclaration) => {
    const noImports = existingImports.length === 0;
    if (noImports) {
      return true;
    }

    return !existingImports.some((i) => {
      const existingImport = i.getModuleSpecifier().getText();
      return existingImport === `'${importDeclaration.moduleSpecifier}'`;
    });
  });

  file.addImportDeclarations(unexistingImports);

  return file.getFullText();
};
