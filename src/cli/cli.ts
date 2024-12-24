import path from 'path';
import yargs from 'yargs';
import { mergeTypeDefs } from '@graphql-tools/merge';

import { hideBin } from 'yargs/helpers';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { format } from 'prettier';
import { print } from 'graphql';

import { GraphQLResolver } from '../transformer/graphql/types';
import { ParserResult } from '../parser';
import { GraphQLTransformer, Parser } from '..';

type TransformedResult =
  | {
      type: 'graphql-type';
      leaf: boolean;
      result: string;
      structure: ParserResult.Structure;
    }
  | {
      type: 'graphql-resolver';
      kind: 'query' | 'mutation';
      result: string;
      structure: ParserResult.Structure;
      resolver?: GraphQLResolver;
    };

type FileTransform = {
  transforms: TransformedResult[];
  document: string;
  path: string;
};

yargs(hideBin(process.argv)).command(
  'gql',
  'convert from TypeScript to GQL',
  (b) =>
    b
      .option('tsconfigPath', {
        alias: 'tsconfig-path',
        type: 'string',
        requiresArg: true,
      })
      .option('prettierConfigPath', {
        alias: 'prettier-config-path',
        type: 'string',
      })
      .option('sourceDirectory', { alias: 'src-dir', type: 'string', requiresArg: true })
      .option('targetDirectory', {
        alias: 'target-dir',
        type: 'string',
        requiresArg: false,
      })
      .option('combinedSchema', { alias: 'schema', type: 'boolean', defalt: false })
      .option('relayConnectionSymbols', {
        alias: 'relay',
        type: 'array',
        default: [] as string[],
      })
      .option('querySymbolSuffix', {
        alias: 'query',
        type: 'string',
      })
      .option('mutationSymbolSuffix', {
        alias: 'mutation',
        type: 'string',
      })
      .option('resolvers', {
        type: 'boolean',
        default: false,
      })
      .option('resolversDirectory', {
        alias: 'resolvers-dir',
        type: 'string',
      })
      .option('resolversTemplate', {
        alias: 'resolvers-template',
        type: 'string',
      })
      .option('resolversMap', {
        alias: 'resolvers-map',
        type: 'string',
      })
      .demandOption('sourceDirectory')
      .demandOption('tsconfigPath'),
  async (args) => {
    const { sourceDirectory: srcDir, targetDirectory: targetDir } = args;

    // ts -> intermediate format
    const parser = new Parser();
    const parsed = parser.parseProject({
      sourceDirectory: args.sourceDirectory,
      tsconfigPath: args.tsconfigPath,
    });
    const { project, results: structures } = parsed;

    console.log('parsed:', args.sourceDirectory);

    const target = targetDir ?? path.resolve(srcDir, '..', '__generated__/graphql');
    if (!existsSync(target)) {
      await mkdir(target, { recursive: true });
    }

    const resolversDir = args.resolversDirectory;
    if (resolversDir) {
      const queries = path.join(resolversDir, './queries');
      const mutations = path.join(resolversDir, './mutations');

      await mkdir(queries, { recursive: true });
      await mkdir(mutations, { recursive: true });
    }

    const resolversTemplate = args.resolversTemplate
      ? readFileSync(args.resolversTemplate).toString('utf-8')
      : '';

    const transformer = new GraphQLTransformer();
    const transformsByFile = new Map<string, FileTransform>();
    const transformsByName = new Map<string, ParserResult.Structure>();

    const entries = Array.from(structures.entries());

    const formattingConfig = args.prettierConfigPath
      ? {
          ...JSON.parse((await readFile(args.prettierConfigPath)).toString()),
          parser: 'graphql',
        }
      : {};

    const querySuffix = args.querySymbolSuffix;
    const mutationSuffix = args.mutationSymbolSuffix;

    const baseStructures = new Set<string>();

    // pass 1: hierarchy analysis
    await Promise.all(
      entries.map(async ([, fileStructures]) => {
        for (const fileStructure of fileStructures) {
          if (!fileStructure) {
            continue;
          }

          fileStructure.extendingStructures.forEach((e) =>
            baseStructures.add(`${e.path}#${e.name}`),
          );
        }
      }),
    );

    // pass 2: intermediate format -> GQL format
    await Promise.all(
      entries.map(async ([filePath, fileStructures]) => {
        // prepare filesystem
        const targetDir = path.resolve(filePath.split(args.sourceDirectory)[1], '..');
        const targetFile = path.basename(filePath).replace('.ts', '.gql');
        const targetPath = path.join(target, `./${targetDir}`, targetFile);

        if (!existsSync(targetPath)) {
          await mkdir(path.resolve(targetPath, '..'), { recursive: true });
        }

        const transforms: TransformedResult[] = [];

        for (const fileStructure of fileStructures) {
          if (!fileStructure) {
            continue;
          }

          const structureId = `${fileStructure.path}#${fileStructure.name}`;
          const structure: ParserResult.Structure = {
            ...fileStructure,
            isBaseStructure: baseStructures.has(structureId),
          };

          // parse query + input params
          if (querySuffix && isSuffixedBy(structure, querySuffix)) {
            const gql = transformer.transformInput(structure, {
              inheritNullabilityFromStructure: true,
              inputType: {
                type: 'query',
                inputNameTransformer: (n) => n.replace(querySuffix, 'Input'),
                resolverNameTransformer: (n) => capitalize(n).replace(querySuffix, ''),
                resolver: resolversDir
                  ? {
                      dir: path.join(resolversDir, './queries'),
                      project,
                      template: resolversTemplate,
                    }
                  : undefined,
              },
            });

            transformsByName.set(structure.name, structure);
            transforms.push({
              result: gql.graphql,
              kind: 'query',
              type: 'graphql-resolver',
              structure,
              resolver: gql.resolver,
            });
          }

          // parse mutation + input params
          else if (mutationSuffix && isSuffixedBy(structure, mutationSuffix)) {
            const gql = transformer.transformInput(structure, {
              inheritNullabilityFromStructure: true,
              inputType: {
                type: 'mutation',
                inputNameTransformer: (name) => name.replace(mutationSuffix, 'Input'),
                resolverNameTransformer: (n) => capitalize(n).replace(mutationSuffix, ''),
                resolver: resolversDir
                  ? {
                      dir: path.join(resolversDir, './mutations'),
                      project,
                      template: resolversTemplate,
                    }
                  : undefined,
              },
            });

            transformsByName.set(structure.name, structure);
            transforms.push({
              type: 'graphql-resolver',
              result: gql.graphql,
              kind: 'mutation',
              structure,
              resolver: gql.resolver,
            });
          }
          // parse type -> GQL type
          else {
            const gql = transformer.transform(structure, {
              inheritNullabilityFromStructure: true,
              useRelayConnectionSpecification: {
                qualifiers: (args.relayConnectionSymbols ?? []) as string[],
              },
            });

            transformsByName.set(structure.name, structure);
            transforms.push({
              result: gql,
              type: 'graphql-type',
              leaf: structure.extendingStructures.length === 0,
              structure,
            });
          }
        }

        const documents = transforms.map((t) => t.result);
        const documentGQL = print(
          mergeTypeDefs(documents, { throwOnConflict: true, sort: true }),
        );
        const gqlPretty = await format(documentGQL, formattingConfig);

        // write GQL document
        await writeFile(targetPath, gqlPretty);

        transformsByFile.set(targetPath, {
          transforms,
          document: gqlPretty,
          path: targetPath,
        });
      }),
    );

    console.log('wrote generated files to:', target);

    // GQL files -> GQL schema
    if (args.combinedSchema) {
      const entries = Array.from(transformsByFile.entries());
      const schema = print(
        mergeTypeDefs(
          entries.map((e) => e[1].document),
          { throwOnConflict: true, sort: true },
        ),
      );

      const schemaPretty = await format(schema, formattingConfig);
      const schemaPath = path.join(target, `./schema.generated.graphql`);

      await writeFile(schemaPath, schemaPretty);
      console.log('wrote combined schema to:', schemaPath);
    }

    // GQL files -> resolver map
    if (args.resolvers) {
      const entries = Array.from(transformsByFile.entries());
      const resolvers: GraphQLResolver[] = [];

      for (const [path, result] of entries) {
        for (const transform of result.transforms) {
          if (transform.type !== 'graphql-resolver') {
            continue;
          }
          if (!transform.resolver) {
            continue;
          }

          // aggregate
          resolvers.push(transform.resolver);

          // do not override
          if (existsSync(transform.resolver.path)) {
            continue;
          }

          // write single resolver to disk
          const contents = await format(transform.resolver.contents, {
            parser: 'typescript',
          });
          await writeFile(transform.resolver.path, contents);
        }
      }

      const resolversTarget = args.resolversMap;
      if (resolversTarget) {
        const map = await transformer.transformResolvers(resolvers, {
          project,
          target: resolversTarget,
        });
        if (map) {
          const contents = await format(map, { parser: 'typescript' });
          await writeFile(resolversTarget, contents);
        }
      }
    }
  },
).argv;

const isSuffixedBy = (structure: ParserResult.Structure, suffix: string | undefined) => {
  if (!suffix) {
    return false;
  }

  return structure.name.endsWith(suffix);
};

const printTransform = ([, transform]: [string, TransformedResult[]]) => {
  const types = transform.filter((t) => t.type === 'graphql-type');
  const resolvers = transform.filter((t) => t.type === 'graphql-resolver');

  let schema = '';

  schema += types.map((t) => t.result).join('\n');
  schema += resolvers.map((r) => r.result).join('\n');

  return schema;
};

const capitalize = (n: string) => {
  return n[0].toLowerCase() + n.slice(1, n.length);
};
