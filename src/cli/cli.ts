import { glob } from 'fast-glob';
import path from 'path';
import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';
import { GraphQLTransformer, Parser } from '..';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { format } from 'prettier';

type TransformedResult = {
  leaf: boolean;
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
      .option('relayConnectionQualifiers', {
        alias: 'relay',
        type: 'array',
        default: [] as string[],
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
    const transformedStructures = new Map<string, TransformedResult>();

    const entries = Array.from(structures.entries());

    const formattingConfig = args.prettierConfigPath
      ? JSON.parse((await readFile(args.prettierConfigPath)).toString())
      : {};

    // intermediate format -> GQL format
    await Promise.all(
      entries.map(async ([filePath, fileStructure]) => {
        if (!fileStructure) {
          return;
        }

        const gql = transformer.transform(fileStructure, {
          inheritNullabilityFromStructure: true,
          useRelayConnectionSpecification: {
            qualifiers: (args.relayConnectionQualifiers as string[]) ?? [],
          },
        });
        const gqlPretty = await format(gql, { parser: 'graphql', ...formattingConfig });

        const targetDir = path.resolve(filePath.split(args.sourceDirectory)[1], '..');
        const targetFile = path.basename(filePath).replace('.ts', '.gql');
        const targetPath = path.join(target, `./${targetDir}`, targetFile);

        if (!existsSync(targetPath)) {
          await mkdir(path.resolve(targetPath, '..'), { recursive: true });
        }

        await writeFile(targetPath, gqlPretty);
        transformedStructures.set(targetPath, {
          leaf: fileStructure.extendingStructures.length === 0,
          result: gqlPretty,
        });
      }),
    );

    console.log('wrote generated files to:', target);

    // GQL files -> GQL schema
    if (args.combinedSchema) {
      const entries = Array.from(transformedStructures.entries());
      let schema = '';

      const leaves: [string, TransformedResult][] = [];
      const nodes: [string, TransformedResult][] = [];

      entries.forEach(([f, v]) => {
        if (v.leaf) {
          leaves.push([f, v]);
        } else {
          nodes.push([f, v]);
        }
      });

      // sort alphabetically for ease of parsing schema
      leaves.sort((a, b) => a[0].localeCompare(b[0]));
      nodes.sort((a, b) => a[0].localeCompare(b[0]));

      // add leaves
      for (const leaf of leaves) {
        schema += leaf[1].result;
        schema += '\n';
      }
      // add nodes
      for (const node of nodes) {
        schema += node[1].result;
        schema += '\n';
      }

      const schemaPretty = await format(schema, {
        parser: 'graphql',
        ...formattingConfig,
      });
      const schemaPath = path.join(target, `./schema.generated.graphql`);

      await writeFile(schemaPath, schemaPretty);
      console.log('wrote combined schema to:', schemaPath);
    }
  },
).argv;
