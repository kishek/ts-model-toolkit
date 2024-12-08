import path from 'path';
import yargs from 'yargs';
import { mergeTypeDefs } from '@graphql-tools/merge';

import { hideBin } from 'yargs/helpers';
import { GraphQLTransformer, Parser, ParserResult } from '..';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { format } from 'prettier';
import { print } from 'graphql';

type TransformedResult =
  | {
      type: 'graphql-type';
      leaf: boolean;
      result: string;
    }
  | {
      type: 'graphql-resolver';
      result: string;
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
      .demandOption('sourceDirectory')
      .demandOption('tsconfigPath'),
  async (args) => {
    const { sourceDirectory: srcDir, targetDirectory: targetDir } = args;

    // ts -> intermediate format
    const parser = new Parser();
    const structures = parser.parseProject({
      sourceDirectory: args.sourceDirectory,
      tsconfigPath: args.tsconfigPath,
    });
    console.log('parsed:', args.sourceDirectory);

    const target = targetDir ?? path.resolve(srcDir, '..', '__generated__/graphql');
    if (!existsSync(target)) {
      await mkdir(target, { recursive: true });
    }

    const transformer = new GraphQLTransformer();
    const transformsByFile = new Map<
      string,
      { transforms: TransformedResult[]; document: string }
    >();

    const entries = Array.from(structures.entries());

    const formattingConfig = args.prettierConfigPath
      ? {
          ...JSON.parse((await readFile(args.prettierConfigPath)).toString()),
          parser: 'graphql',
        }
      : {};

    const querySuffix = args.querySymbolSuffix;
    const mutationSuffix = args.mutationSymbolSuffix;

    // intermediate format -> GQL format
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

          // parse query + input params
          if (querySuffix && isSuffixedBy(fileStructure, querySuffix)) {
            const gql = transformer.transform(fileStructure, {
              inheritNullabilityFromStructure: true,
              inputType: {
                type: 'query',
                inputNameTransformer: (n) => n.replace(querySuffix, 'Input'),
                resolverNameTransformer: (n) => n[0].toLowerCase() + n.slice(1, n.length),
              },
            });

            transforms.push({
              result: gql,
              type: 'graphql-resolver',
            });
          }

          // parse mutation + input params
          else if (mutationSuffix && isSuffixedBy(fileStructure, mutationSuffix)) {
            const gql = transformer.transform(fileStructure, {
              inheritNullabilityFromStructure: true,
              inputType: {
                type: 'mutation',
                inputNameTransformer: (name) => name.replace(mutationSuffix, 'Input'),
                resolverNameTransformer: (n) => n[0].toLowerCase() + n.slice(1, n.length),
              },
            });

            transforms.push({
              result: gql,
              type: 'graphql-resolver',
            });
          }
          // parse type -> GQL type
          else {
            const gql = transformer.transform(fileStructure, {
              inheritNullabilityFromStructure: true,
              useRelayConnectionSpecification: {
                qualifiers: (args.relayConnectionSymbols ?? []) as string[],
              },
            });

            transforms.push({
              result: gql,
              type: 'graphql-type',
              leaf: fileStructure.extendingStructures.length === 0,
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

        transformsByFile.set(targetPath, { transforms, document: gqlPretty });
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
