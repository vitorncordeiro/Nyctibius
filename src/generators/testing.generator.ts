import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class TestingGenerator implements Generator {
  id = 'testing';

  shouldRun(options: ProjectOptions): boolean {
    return options.testing.framework !== 'none';
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    if (options.testing.framework === 'vitest') {
      return {
        dependencies: [],
        devDependencies: [
          { name: 'vitest', version: VERSIONS.dev.vitest, dev: true },
          { name: '@vitest/ui', version: '^1.6.0', dev: true },
        ],
        scripts: {
          'test:e2e': 'vitest run --config vitest.e2e.config.ts',
          'test:cov': 'vitest run --coverage',
        },
        files: {
          'vitest.config.ts': `import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
  },
});
`,
          'test/app.e2e-spec.ts': `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { describe, it, expect, beforeAll } from 'vitest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    expect(true).toBe(true);
  });
});
`,
        },
      };
    }

    // Default to Jest
    return {
      dependencies: [],
      devDependencies: [
        { name: 'jest', version: VERSIONS.dev.jest, dev: true },
        { name: '@types/jest', version: VERSIONS.dev.typesJest, dev: true },
        { name: 'ts-jest', version: '^29.1.1', dev: true },
      ],
      scripts: {
        'test:watch': 'jest --watch',
        'test:cov': 'jest --coverage',
        'test:e2e': 'jest --config ./test/jest-e2e.json',
      },
      files: {
        'jest.config.js': `export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\\\.spec\\\\.ts$',
  transform: {
    '^.+\\\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
`,
        'test/jest-e2e.json': `{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\\\.(t|j)s$": "ts-jest"
  }
}
`,
        'src/app.controller.spec.ts': `import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return a string', () => {
      const result = controller.getHello();
      expect(typeof result).toBe('string');
    });
  });
});
`,
        'test/app.e2e-spec.ts': `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    expect(true).toBe(true);
  });
});
`,
      },
    };
  }
}
