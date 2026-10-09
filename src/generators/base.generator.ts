import type { Generator, Contribution } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class BaseGenerator implements Generator {
  id = 'base';

  shouldRun(): boolean {
    return true;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const scripts = {
      start: 'node dist/main.js',
      'start:dev': 'tsx watch src/main.ts',
      'start:debug': 'node --inspect-brk dist/main.js',
      build: 'tsc -p tsconfig.build.json',
      lint: 'eslint . --ext .ts',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
    };

    const validationDependencies =
      options.api.validation === 'class-validator'
        ? [
            { name: 'class-validator', version: VERSIONS.validation.classValidator },
            { name: 'class-transformer', version: VERSIONS.validation.classTransformer },
          ]
        : [];

    return {
      dependencies: [
        { name: '@nestjs/common', version: VERSIONS.nestjs.common },
        { name: '@nestjs/core', version: VERSIONS.nestjs.core },
        { name: '@nestjs/platform-express', version: VERSIONS.nestjs.platform },
        { name: '@nestjs/config', version: VERSIONS.nestjs.config },
        { name: 'reflect-metadata', version: VERSIONS.core.reflectMetadata },
        { name: 'rxjs', version: VERSIONS.core.rxjs },
        { name: 'zod', version: VERSIONS.validation.zod },
        ...validationDependencies,
      ],
      devDependencies: [
        { name: '@types/node', version: VERSIONS.dev.typesNode, dev: true },
        { name: '@nestjs/cli', version: VERSIONS.nestjs.cli, dev: true },
        { name: 'ts-node', version: VERSIONS.dev.tsNode, dev: true },
        { name: 'tsx', version: VERSIONS.dev.tsx, dev: true },
        { name: 'typescript', version: VERSIONS.dev.typescript, dev: true },
        { name: '@types/jest', version: VERSIONS.dev.typesJest, dev: true },
        { name: 'jest', version: VERSIONS.dev.jest, dev: true },
      ],
      scripts,
      env: [
        { name: 'NODE_ENV', value: 'development' },
        { name: 'PORT', value: '3000' },
      ],
      moduleImports: [],
      bootstrapHooks: [
        'app.setGlobalPrefix("api");',
        'app.enableCors();',
      ],
      files: {
        'tsconfig.json': `{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
`,
        'tsconfig.build.json': `{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist"]
}
`,
        'nest-cli.json': `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
`,
        'src/app.controller.ts': `import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello from Nyctibius!';
  }
}
`,
        'src/app.service.ts': `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from Nyctibius!';
  }
}
`,
        'src/config/env.validation.ts': `import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
`,
        'src/config/configuration.ts': `export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
});
`,
      },
      postGeneration: ['npm install'],
    };
  }
}
