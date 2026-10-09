/**
 * Centralized version management for all dependencies
 * Ensures consistency across all generated projects
 */

export const VERSIONS = {
  // NestJS Framework
  nestjs: {
    common: '^11.0.0',
    core: '^11.0.0',
    cli: '^11.0.0',
    config: '^4.0.0',
    platform: '^11.0.0',
    swagger: '^11.0.0',
    axios: '^11.0.0',
    jwt: '^11.0.0',
    passport: '^11.0.0',
    microservices: '^11.0.0',
    bullmq: '^11.0.0',
    terminus: '^10.2.3',
    throttler: '^6.1.0',
  },

  // Authentication & Security
  auth: {
    passport: '^0.7.0',
    passportJwt: '^4.0.1',
    bcryptjs: '^2.4.3',
    jsonwebtoken: '^9.1.2',
  },

  // Data & ORM
  database: {
    prisma: '^6.0.0',
    prismaClient: '^6.0.0',
  },

  // Cache & Storage
  cache: {
    ioredis: '^5.6.1',
  },

  // Message Queues & Jobs
  messaging: {
    bullmq: '^5.0.0',
    kafkajs: '^2.2.4',
    amqplib: '^0.10.3',
  },

  // Validation & Serialization
  validation: {
    classValidator: '^0.14.1',
    classTransformer: '^0.5.1',
    zod: '^3.23.8',
  },

  // Logging
  logging: {
    pino: '^8.17.2',
    pinoHttp: '^8.6.1',
  },

  // Infrastructure & Utilities
  core: {
    reflectMetadata: '^0.2.2',
    rxjs: '^7.8.1',
  },

  // Development Tools
  dev: {
    typescript: '^5.7.2',
    tsNode: '^10.9.2',
    tsx: '^4.19.2',
    typesNode: '^22.10.2',
    eslint: '^8.57.1',
    prettier: '^3.3.3',
    jest: '^29.7.0',
    typesJest: '^29.5.12',
    jestEsmRunner: '^1.1.1',
    vitest: '^1.6.0',
    husky: '^9.1.7',
    lintStaged: '^15.2.11',
    commitlint: '^19.6.1',
  },

  // Docker Base Images
  docker: {
    nodeAlpine: 'node:22-alpine',
    postgres: 'postgres:17',
    mongodb: 'mongo:7',
    redis: 'redis:7-alpine',
    rabbitmq: 'rabbitmq:3.13-management-alpine',
    kafka: 'confluentinc/cp-kafka:7.6.1',
  },
} as const;

/**
 * Get version for a package name
 */
export function getVersion(packageName: string): string {
  const parts = packageName.split('.');
  let current: any = VERSIONS;

  for (const part of parts) {
    current = current[part];
    if (!current) {
      throw new Error(`Version not found for package: ${packageName}`);
    }
  }

  return current;
}
