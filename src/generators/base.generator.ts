import type { Generator, Contribution } from './types.js';
import type { ProjectOptions } from '../types.js';

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
      test: 'node --test',
      'test:watch': 'node --test --watch',
    };

    const validationDependencies =
      options.api.validation === 'class-validator'
        ? [
            { name: 'class-validator', version: '^0.13.2' },
            { name: 'class-transformer', version: '^0.5.1' },
          ]
        : [];

    return {
      dependencies: [
        { name: '@nestjs/common', version: '^11.0.0' },
        { name: '@nestjs/core', version: '^11.0.0' },
        { name: '@nestjs/platform-express', version: '^11.0.0' },
        { name: '@nestjs/config', version: '^4.0.0' },
        { name: 'reflect-metadata', version: '^0.2.2' },
        { name: 'rxjs', version: '^7.6.0' },
        { name: 'zod', version: '^3.23.8' },
        ...validationDependencies,
      ],
      devDependencies: [
        { name: '@types/node', version: '^22.10.2', dev: true },
        { name: '@nestjs/cli', version: '^11.0.0', dev: true },
        { name: 'ts-node', version: '^10.9.2', dev: true },
        { name: 'tsx', version: '^4.19.2', dev: true },
        { name: 'typescript', version: '^5.7.2', dev: true },
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
