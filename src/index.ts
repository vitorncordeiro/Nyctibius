#!/usr/bin/env node

import { execa } from 'execa';
import { Command } from 'commander';
import { access } from 'node:fs/promises';
import { join } from 'node:path';

import { getGenerators } from './registry.js';
import { assembleProject, writeGeneratedProject } from './assembler.js';
import { DEFAULT_OPTIONS, type ProjectOptions } from './types.js';
import { parseProjectOptions, resolveAutomaticChoices } from './project-options.js';
import { promptProjectConfiguration } from './prompts.js';

const program = new Command();
program
  .name('nyctibius')
  .description('Generate a NestJS project scaffold.')
  .argument('[projectName]', 'Project name', 'my-api')
  .option('--interactive', 'Prompt for project settings interactively')
  .option('--package-manager <manager>', 'Package manager to use')
  .option('--database <provider>', 'Database provider: postgres, mysql, mongodb, none')
  .option('--orm <orm>', 'ORM/ODM: prisma, typeorm, mongoose, none')
  .option('--swagger', 'Enable Swagger')
  .option('--auth <provider>', 'Auth provider: jwt or none')
  .option('--cache <provider>', 'Cache provider: redis or none')
  .option('--redis', 'Enable Redis cache')
  .option('--messaging <provider>', 'Messaging provider: rabbitmq, kafka or none')
  .option('--jobs <provider>', 'Jobs provider: bullmq or none')
  .option('--docker', 'Generate Docker files')
  .option('--dry-run', 'Only print planned output without writing files')
  .option('--no-install', 'Skip installing generated dependencies')
  .allowUnknownOption(false);

program.parse(process.argv);

const cliOptions = program.opts();
const projectName = program.args[0] ?? 'my-api';
const hasExplicitConfig =
  cliOptions.database !== undefined ||
  cliOptions.orm !== undefined ||
  Boolean(cliOptions.swagger) ||
  cliOptions.auth !== undefined ||
  cliOptions.cache !== undefined ||
  Boolean(cliOptions.redis) ||
  cliOptions.messaging !== undefined ||
  cliOptions.jobs !== undefined ||
  Boolean(cliOptions.docker) ||
  Boolean(cliOptions.interactive);

const baseOptions: Partial<ProjectOptions> = {
  ...DEFAULT_OPTIONS,
  projectName,
  packageManager: cliOptions.packageManager ?? DEFAULT_OPTIONS.packageManager,
  api: {
    ...DEFAULT_OPTIONS.api,
    swagger: Boolean(cliOptions.swagger) || DEFAULT_OPTIONS.api.swagger,
  },
  database: {
    ...DEFAULT_OPTIONS.database,
    provider: cliOptions.database ?? DEFAULT_OPTIONS.database.provider,
    orm: cliOptions.orm ?? DEFAULT_OPTIONS.database.orm,
  },
  auth: {
    ...DEFAULT_OPTIONS.auth,
    provider: cliOptions.auth ?? DEFAULT_OPTIONS.auth.provider,
  },
  cache: {
    ...DEFAULT_OPTIONS.cache,
    provider: cliOptions.cache ?? (cliOptions.redis ? 'redis' : DEFAULT_OPTIONS.cache.provider),
  },
  messaging: {
    ...DEFAULT_OPTIONS.messaging,
    provider: cliOptions.messaging ?? DEFAULT_OPTIONS.messaging.provider,
  },
  jobs: {
    ...DEFAULT_OPTIONS.jobs,
    provider: cliOptions.jobs ?? DEFAULT_OPTIONS.jobs.provider,
  },
  docker: {
    ...DEFAULT_OPTIONS.docker,
    enabled: Boolean(cliOptions.docker) || DEFAULT_OPTIONS.docker.enabled,
  },
};

const shouldPrompt = cliOptions.interactive || (!hasExplicitConfig && process.stdin.isTTY);
const interactiveOptions = shouldPrompt ? await promptProjectConfiguration(baseOptions) : {};
const mergedOptions = {
  ...DEFAULT_OPTIONS,
  ...baseOptions,
  ...interactiveOptions,
};
const options = resolveAutomaticChoices(parseProjectOptions(mergedOptions));

const targetDir = join(process.cwd(), options.projectName);

try {
  await access(targetDir);
  console.error(`Destination directory already exists: ${targetDir}`);
  process.exitCode = 1;
  process.exit();
} catch {
  // directory does not exist; continue
}

const contributions = await Promise.all(
  getGenerators()
    .filter((generator) => generator.shouldRun(options))
    .map(async (generator) => generator.contribute({ options })),
);
const { files } = assembleProject(options, contributions);

if (cliOptions.dryRun) {
  console.log(`Dry run for ${options.projectName}`);
  console.log('Files to generate:');
  console.log(Object.keys(files).join('\n'));
  console.log(`Dependencies: ${Object.keys(assembleProject(options, contributions).packageJson.dependencies ?? {}).length}`);
  process.exit(0);
}

await writeGeneratedProject(targetDir, options, contributions);

if (cliOptions.install !== false) {
  await execa(options.packageManager, ['install'], { cwd: targetDir, stdio: 'inherit' });
}

console.log(`Project ${options.projectName} created at ${targetDir}`);
