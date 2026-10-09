export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type ApiAdapter = 'express' | 'fastify';
export type ValidationMode = 'class-validator' | 'zod' | 'none';
export type HttpClientProvider = 'axios' | 'none';
export type DatabaseProvider = 'postgres' | 'mysql' | 'mongodb' | 'none';
export type DatabaseOrm = 'prisma' | 'typeorm' | 'mongoose' | 'none';
export type AuthProvider = 'jwt' | 'none';
export type CacheProvider = 'redis' | 'none';
export type MessagingProvider = 'rabbitmq' | 'kafka' | 'none';
export type JobsProvider = 'bullmq' | 'none';
export type LoggingProvider = 'pino' | 'winston' | 'nest';

export interface ProjectOptions {
  projectName: string;
  packageManager: PackageManager;
  nodeVersion: string;
  preset?: string;
  api: {
    adapter: ApiAdapter;
    swagger: boolean;
    validation: ValidationMode;
    httpClient: HttpClientProvider;
  };
  database: {
    provider: DatabaseProvider;
    orm: DatabaseOrm;
  };
  auth: {
    provider: AuthProvider;
    refreshToken: boolean;
  };
  cache: {
    provider: CacheProvider;
  };
  messaging: {
    provider: MessagingProvider;
  };
  jobs: {
    provider: JobsProvider;
  };
  logging: {
    provider: LoggingProvider;
  };
  health: boolean;
  docker: {
    enabled: boolean;
    compose: boolean;
  };
  git: {
    initialize: boolean;
  };
  quality: {
    eslint: boolean;
    prettier: boolean;
    husky: boolean;
  };
  testing: {
    framework: 'jest' | 'vitest' | 'none';
  };
}

export const DEFAULT_OPTIONS: ProjectOptions = {
  projectName: 'my-api',
  packageManager: 'npm',
  nodeVersion: '22',
  api: {
    adapter: 'express',
    swagger: true,
    validation: 'class-validator',
    httpClient: 'none',
  },
  database: {
    provider: 'postgres',
    orm: 'prisma',
  },
  auth: {
    provider: 'jwt',
    refreshToken: true,
  },
  cache: {
    provider: 'none',
  },
  messaging: {
    provider: 'none',
  },
  jobs: {
    provider: 'none',
  },
  logging: {
    provider: 'pino',
  },
  health: true,
  docker: {
    enabled: true,
    compose: true,
  },
  git: {
    initialize: true,
  },
  quality: {
    eslint: true,
    prettier: true,
    husky: false,
  },
  testing: {
    framework: 'jest',
  },
};
