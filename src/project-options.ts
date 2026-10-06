import { z } from 'zod';

import { DEFAULT_OPTIONS, type ProjectOptions } from './types.js';

const projectOptionsSchema = z.object({
  projectName: z.string().min(1),
  packageManager: z.enum(['npm', 'pnpm', 'yarn']),
  nodeVersion: z.string().min(1),
  api: z.object({
    adapter: z.enum(['express', 'fastify']),
    swagger: z.boolean(),
    validation: z.enum(['class-validator', 'zod', 'none']),
  }),
  database: z.object({
    provider: z.enum(['postgres', 'mysql', 'mongodb', 'none']),
    orm: z.enum(['prisma', 'typeorm', 'mongoose', 'none']),
  }),
  auth: z.object({
    provider: z.enum(['jwt', 'none']),
    refreshToken: z.boolean(),
  }),
  cache: z.object({
    provider: z.enum(['redis', 'none']),
  }),
  messaging: z.object({
    provider: z.enum(['rabbitmq', 'kafka', 'none']),
  }),
  jobs: z.object({
    provider: z.enum(['bullmq', 'none']),
  }),
  logging: z.object({
    provider: z.enum(['pino', 'winston', 'nest']),
  }),
  health: z.boolean(),
  docker: z.object({
    enabled: z.boolean(),
    compose: z.boolean(),
  }),
  git: z.object({
    initialize: z.boolean(),
  }),
  quality: z.object({
    eslint: z.boolean(),
    prettier: z.boolean(),
    husky: z.boolean(),
  }),
  testing: z.object({
    framework: z.enum(['jest', 'vitest', 'none']),
  }),
});

export function validateProjectOptions(options: ProjectOptions): ProjectOptions {
  if (options.jobs.provider === 'bullmq' && options.cache.provider !== 'redis') {
    throw new Error('BullMQ requires Redis.');
  }

  if (options.database.provider === 'none' && options.database.orm !== 'none') {
    throw new Error('ORM is invalid when database is disabled.');
  }

  if (options.database.provider === 'mongodb' && options.database.orm === 'typeorm') {
    throw new Error('TypeORM conflicts with MongoDB.');
  }

  if (options.database.provider !== 'none' && options.database.orm === 'none') {
    throw new Error('A database ORM must be selected when a database provider is enabled.');
  }

  return options;
}

export function parseProjectOptions(input: Partial<ProjectOptions>): ProjectOptions {
  const normalized = {
    ...DEFAULT_OPTIONS,
    ...input,
    api: {
      ...DEFAULT_OPTIONS.api,
      ...input.api,
    },
    database: {
      ...DEFAULT_OPTIONS.database,
      ...input.database,
    },
    auth: {
      ...DEFAULT_OPTIONS.auth,
      ...input.auth,
    },
    cache: {
      ...DEFAULT_OPTIONS.cache,
      ...input.cache,
    },
    messaging: {
      ...DEFAULT_OPTIONS.messaging,
      ...input.messaging,
    },
    jobs: {
      ...DEFAULT_OPTIONS.jobs,
      ...input.jobs,
    },
    logging: {
      ...DEFAULT_OPTIONS.logging,
      ...input.logging,
    },
    docker: {
      ...DEFAULT_OPTIONS.docker,
      ...input.docker,
    },
    git: {
      ...DEFAULT_OPTIONS.git,
      ...input.git,
    },
    quality: {
      ...DEFAULT_OPTIONS.quality,
      ...input.quality,
    },
    testing: {
      ...DEFAULT_OPTIONS.testing,
      ...input.testing,
    },
  } satisfies ProjectOptions;

  const parsed = projectOptionsSchema.parse(normalized);
  return resolveAutomaticChoices(parsed);
}

export function resolveAutomaticChoices(options: ProjectOptions): ProjectOptions {
  let next = { ...options };

  if (next.jobs.provider === 'bullmq' && next.cache.provider === 'none') {
    next = {
      ...next,
      cache: { ...next.cache, provider: 'redis' },
    };
  }

  if (next.database.provider === 'none' && next.database.orm !== 'none') {
    next = {
      ...next,
      database: { ...next.database, orm: 'none' },
    };
  }

  if (next.database.provider !== 'none' && next.database.orm === 'none') {
    next = {
      ...next,
      database: { ...next.database, orm: 'prisma' },
    };
  }

  if (next.database.provider === 'mongodb' && next.database.orm === 'typeorm') {
    next = {
      ...next,
      database: { ...next.database, orm: 'mongoose' },
    };
  }

  if (next.database.provider === 'mongodb' && next.database.orm === 'prisma') {
    next = {
      ...next,
      database: { ...next.database, orm: 'prisma' },
    };
  }

  return validateProjectOptions(next);
}
