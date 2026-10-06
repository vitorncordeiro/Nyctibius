import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ProjectOptions } from './types.js';
import type { Contribution, Dependency, DockerService } from './generators/types.js';

export interface BuildArtifacts {
  packageJson: Record<string, any>;
  files: Record<string, string>;
  envExample: string;
  envLocal: string;
  dockerCompose: string;
}

function mergeEntries(entries: Dependency[] = []): Record<string, string> {
  return entries.reduce<Record<string, string>>((acc, item) => {
    acc[item.name] = item.version;
    return acc;
  }, {});
}

function renderDockerCompose(services: DockerService[]): string {
  const rendered = services
    .map((service) => {
      const lines = [`  ${service.name}:`, `    image: ${service.image}`];

      if (service.ports?.length) {
        lines.push('    ports:');
        for (const port of service.ports) {
          lines.push(`      - ${port}`);
        }
      }

      if (service.environment?.length) {
        lines.push('    environment:');
        for (const value of service.environment) {
          lines.push(`      - ${value}`);
        }
      }

      if (service.volumes?.length) {
        lines.push('    volumes:');
        for (const volume of service.volumes) {
          lines.push(`      - ${volume}`);
        }
      }

      if (service.dependsOn?.length) {
        lines.push('    depends_on:');
        for (const dependency of service.dependsOn) {
          lines.push(`      - ${dependency}`);
        }
      }

      if (service.healthcheck) {
        lines.push(`    healthcheck: ${service.healthcheck}`);
      }

      return lines.join('\n');
    })
    .join('\n\n');

  return `services:\n${rendered}\n`;
}

export function assembleProject(options: ProjectOptions, contributions: Contribution[]): BuildArtifacts {
  const dependencies = mergeEntries(contributions.flatMap((contribution) => contribution.dependencies ?? []));
  const devDependencies = mergeEntries(contributions.flatMap((contribution) => contribution.devDependencies ?? []));

  const scripts = contributions.reduce<Record<string, string>>((acc, contribution) => {
    Object.assign(acc, contribution.scripts ?? {});
    return acc;
  }, {
    start: 'node dist/main.js',
    'start:dev': 'tsx watch src/main.ts',
    'start:debug': 'node --inspect-brk dist/main.js',
    build: 'tsc -p tsconfig.build.json',
    lint: 'eslint . --ext .ts',
    test: 'node --test',
  });

  const mergedFiles = contributions.reduce<Record<string, string>>((acc, contribution) => {
    Object.assign(acc, contribution.files ?? {});
    return acc;
  }, {});

  const envEntries = contributions.flatMap((contribution) => contribution.env ?? []);
  const envExampleLines = ['NODE_ENV=development', 'PORT=3000'];
  const envLocalLines = ['NODE_ENV=development', 'PORT=3000'];

  for (const entry of envEntries) {
    envExampleLines.push(`${entry.name}=${entry.value}`);
    envLocalLines.push(`${entry.name}=${entry.value}`);
  }

  const uniqueEnv = Array.from(new Set([...envExampleLines, 'JWT_SECRET=change-me']));
  const uniqueEnvLocal = Array.from(new Set([...envLocalLines, 'JWT_SECRET=change-me']));

  const moduleImports = Array.from(
    new Set(contributions.flatMap((contribution) => contribution.moduleImports ?? [])),
  );

  const bootstrapHooks = Array.from(
    new Set(contributions.flatMap((contribution) => contribution.bootstrapHooks ?? [])),
  );

  const moduleImportPaths: Record<string, string> = {
    AuthModule: './auth/auth.module.js',
    BullModule: './jobs/jobs.module.js',
    JobsModule: './jobs/jobs.module.js',
    KafkaModule: './messaging/kafka/kafka.module.js',
    PrismaModule: './database/prisma.module.js',
    RabbitMqModule: './messaging/rabbitmq/rabbitmq.module.js',
    RedisModule: './cache/redis.module.js',
  };

  const importStatements = [
    "import { Module } from '@nestjs/common';",
    "import { ConfigModule } from '@nestjs/config';",
    "import { AppController } from './app.controller.js';",
    "import { AppService } from './app.service.js';",
    "import { envSchema } from './config/env.validation.js';",
  ];

  for (const moduleName of moduleImports) {
    const importPath = moduleImportPaths[moduleName];
    if (importPath) {
      importStatements.push(`import { ${moduleName} } from '${importPath}';`);
    }
  }

  const moduleEntries = [
    `ConfigModule.forRoot({\n      isGlobal: true,\n      envFilePath: ['.env', '.env.local'],\n      validate: (config) => envSchema.parse(config),\n    })`,
    ...moduleImports,
  ];

  const generatedAppModule = `${importStatements.join('\n')}\n\n@Module({\n  imports: [\n    ${moduleEntries.join(',\n    ')}\n  ],\n  controllers: [AppController],\n  providers: [AppService],\n})\nexport class AppModule {}\n`;

  const mainImports = [
    "import { ValidationPipe } from '@nestjs/common';",
    "import { NestFactory } from '@nestjs/core';",
    "import { AppModule } from './app.module.js';",
  ];

  if (options.api.swagger) {
    mainImports.push("import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';");
  }

  const generatedMain = `${mainImports.join('\n')}\n\nasync function bootstrap(): Promise<void> {\n  const app = await NestFactory.create(AppModule${options.api.adapter === 'fastify' ? ', { logger: true }' : ''});\n  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));\n  ${bootstrapHooks.join('\n  ')}\n\n  await app.listen(process.env.PORT ?? 3000);\n}\n\nbootstrap();\n`;

  const dockerCompose = renderDockerCompose(contributions.flatMap((contribution) => contribution.dockerServices ?? []));

  mergedFiles['src/app.module.ts'] = generatedAppModule;
  mergedFiles['src/main.ts'] = generatedMain;
  mergedFiles['.env.example'] = uniqueEnv.join('\n') + '\n';
  mergedFiles['.env'] = uniqueEnvLocal.join('\n') + '\n';
  mergedFiles['docker-compose.yml'] = dockerCompose + '\n';
  mergedFiles['.gitignore'] = ['node_modules', '.env', '.env.local', '.env.*', '!.env.example', 'dist', 'coverage'].join('\n') + '\n';

  const packageJson = {
    name: options.projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts,
    dependencies: {
      '@nestjs/common': '^11.0.0',
      '@nestjs/config': '^4.0.0',
      '@nestjs/core': '^11.0.0',
      '@nestjs/platform-express': '^11.0.0',
      '@nestjs/swagger': '^11.0.0',
      ...dependencies,
    },
    devDependencies: {
      '@nestjs/cli': '^11.0.0',
      '@types/node': '^22.10.2',
      tsx: '^4.19.2',
      typescript: '^5.7.2',
      ...devDependencies,
    },
    engines: {
      node: `>=${options.nodeVersion}`,
    },
  };

  return {
    packageJson,
    files: mergedFiles,
    envExample: uniqueEnv.join('\n') + '\n',
    envLocal: uniqueEnvLocal.join('\n') + '\n',
    dockerCompose,
  };
}

export async function writeGeneratedProject(
  targetDir: string,
  options: ProjectOptions,
  contributions: Contribution[],
): Promise<void> {
  const { files, packageJson } = assembleProject(options, contributions);

  await mkdir(targetDir, { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = join(targetDir, relativePath);
    await mkdir(join(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, content, 'utf8');
  }

  await writeFile(join(targetDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
}
