import assert from 'node:assert/strict';
import test from 'node:test';

import { assembleProject } from '../src/assembler.js';
import { getGenerators } from '../src/registry.js';
import { validateProjectOptions } from '../src/project-options.js';
import { DEFAULT_OPTIONS } from '../src/types.js';
import type { ProjectOptions } from '../src/types.js';
import { VERSIONS } from '../src/versions.js';

async function assembleWithGenerators(options: ProjectOptions) {
  const contributions = await Promise.all(
    getGenerators()
      .filter((generator) => generator.shouldRun(options))
      .map(async (generator) => generator.contribute({ options })),
  );
  return assembleProject(options, contributions);
}

test('Smoke Test - Version Standardization: core dependencies use VERSIONS constant', async () => {
  const { packageJson } = await assembleWithGenerators(DEFAULT_OPTIONS);
  const pkg = packageJson as Record<string, any>;

  // Check key dependencies match VERSIONS constant
  assert.equal(pkg.dependencies['@nestjs/common'], VERSIONS.nestjs.common);
  assert.equal(pkg.dependencies['@nestjs/core'], VERSIONS.nestjs.core);
  assert.equal(pkg.dependencies['zod'], VERSIONS.validation.zod);
  assert.equal(pkg.devDependencies['typescript'], VERSIONS.dev.typescript);
  assert.equal(pkg.devDependencies['jest'], VERSIONS.dev.jest);
});

test('Smoke Test - Swagger: dependency version is standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    api: { ...DEFAULT_OPTIONS.api, swagger: true },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.ok(pkg.dependencies['@nestjs/swagger'], 'Swagger dependency should be included');
  assert.equal(pkg.dependencies['@nestjs/swagger'], VERSIONS.nestjs.swagger);
});

test('Smoke Test - JWT: auth dependencies are standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    auth: { provider: 'jwt', refreshToken: true },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['@nestjs/jwt'], VERSIONS.nestjs.jwt);
  assert.equal(pkg.dependencies['@nestjs/passport'], VERSIONS.nestjs.passport);
  assert.equal(pkg.dependencies['passport'], VERSIONS.auth.passport);
  assert.equal(pkg.dependencies['passport-jwt'], VERSIONS.auth.passportJwt);
  assert.equal(pkg.dependencies['bcryptjs'], VERSIONS.auth.bcryptjs);
});

test('Smoke Test - Prisma: database dependencies are standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    database: { provider: 'postgres', orm: 'prisma' },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['@prisma/client'], VERSIONS.database.prismaClient);
  assert.equal(pkg.devDependencies['prisma'], VERSIONS.database.prisma);
});

test('Smoke Test - Redis: cache dependency is standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    cache: { provider: 'redis' },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['ioredis'], VERSIONS.cache.ioredis);
});

test('Smoke Test - BullMQ: job queue dependencies are standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    cache: { provider: 'redis' },
    jobs: { provider: 'bullmq' },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['bullmq'], VERSIONS.messaging.bullmq);
  assert.equal(pkg.dependencies['@nestjs/bullmq'], VERSIONS.nestjs.bullmq);
});

test('Smoke Test - Kafka: messaging dependency is standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    messaging: { provider: 'kafka' },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['@nestjs/microservices'], VERSIONS.nestjs.microservices);
});

test('Smoke Test - RabbitMQ: messaging dependency is standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    messaging: { provider: 'rabbitmq' },
  };

  const { packageJson } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['@nestjs/microservices'], VERSIONS.nestjs.microservices);
});

test('Smoke Test - Axios: HTTP client dependency is standardized', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    api: { ...DEFAULT_OPTIONS.api, httpClient: 'axios' },
  };

  const { packageJson, files } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  assert.equal(pkg.dependencies['@nestjs/axios'], VERSIONS.nestjs.axios);
  assert.ok(files['src/http/http-client.module.ts']);
});

test('Smoke Test - Docker: compose includes relevant services and health checks', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    database: { provider: 'postgres', orm: 'prisma' },
    cache: { provider: 'redis' },
    messaging: { provider: 'kafka' },
    docker: { enabled: true, compose: true },
  };

  const { files } = await assembleWithGenerators(options);
  const dockerfile = files['Dockerfile'];
  const dockerCompose = files['docker-compose.yml'];

  assert.ok(dockerfile, 'Dockerfile should be generated');
  assert.ok(
    (dockerfile as string).includes(VERSIONS.docker.nodeAlpine),
    'Dockerfile should use standardized Node Alpine image',
  );
  assert.ok(dockerCompose, 'docker-compose.yml should be generated');
  assert.match(dockerCompose as string, /services:/);
  assert.match(dockerCompose as string, /db:/);
  assert.match(dockerCompose as string, /redis:/);
  assert.match(dockerCompose as string, /kafka:/);
  assert.match(dockerCompose as string, /healthcheck:/);
});

test('Smoke Test - Validation: invalid combinations are properly caught', () => {
  const invalidOptions: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    cache: { provider: 'none' },
    jobs: { provider: 'bullmq' },
  };

  assert.throws(
    () => validateProjectOptions(invalidOptions),
    /BullMQ requires Redis/,
  );
});

test('Smoke Test - Full stack project with all technologies', async () => {
  const options: ProjectOptions = {
    ...DEFAULT_OPTIONS,
    api: {
      adapter: 'express',
      swagger: true,
      validation: 'class-validator',
    },
    database: { provider: 'postgres', orm: 'prisma' },
    auth: { provider: 'jwt', refreshToken: true },
    cache: { provider: 'redis' },
    messaging: { provider: 'kafka' },
    jobs: { provider: 'bullmq' },
    health: true,
    docker: { enabled: true, compose: true },
    git: { initialize: true },
  };

  const { packageJson, envExample, files, dockerCompose } = await assembleWithGenerators(options);
  const pkg = packageJson as Record<string, any>;

  // Verify key dependencies are present and use correct versions
  assert.equal(pkg.dependencies['@nestjs/common'], VERSIONS.nestjs.common);
  assert.equal(pkg.dependencies['@nestjs/swagger'], VERSIONS.nestjs.swagger);
  assert.equal(pkg.dependencies['@nestjs/jwt'], VERSIONS.nestjs.jwt);
  assert.equal(pkg.dependencies['ioredis'], VERSIONS.cache.ioredis);
  assert.equal(pkg.dependencies['bullmq'], VERSIONS.messaging.bullmq);
  assert.equal(pkg.dependencies['@nestjs/microservices'], VERSIONS.nestjs.microservices);

  // Verify environment variables
  assert.ok(envExample);
  assert.match(envExample, /NODE_ENV/);
  assert.match(envExample, /PORT/);
  assert.match(envExample, /DATABASE_URL/);
  assert.match(envExample, /JWT_SECRET/);

  // Verify generated files exist
  assert.ok(files['src/auth/auth.module.ts']);
  assert.ok(files['src/cache/redis.service.ts']);
  assert.ok(files['src/messaging/kafka/kafka.module.ts']);
  assert.ok(files['src/database/prisma.service.ts']);

  // Verify Docker Compose
  assert.ok(dockerCompose);
  assert.match(dockerCompose, /services:/);
  assert.ok(dockerCompose.includes(VERSIONS.docker.postgres));
  assert.ok(dockerCompose.includes(VERSIONS.docker.redis));
});
