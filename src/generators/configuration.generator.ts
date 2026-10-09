import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class ConfigurationGenerator implements Generator {
  id = 'configuration';

  shouldRun(): boolean {
    return true;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    return {
      dependencies: [
        { name: '@nestjs/config', version: VERSIONS.nestjs.config },
      ],
      env: [
        { name: 'NODE_ENV', value: 'development' },
        { name: 'LOG_LEVEL', value: 'debug' },
      ],
      moduleImports: ['ConfigModule'],
      files: {
        'src/config/index.ts': `export { configuration } from './configuration.js';
export { envSchema, type EnvConfig } from './env.validation.js';
`,
        'src/config/configuration.ts': `import type { EnvConfig } from './env.validation.js';

export const configuration = (): EnvConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'debug',
  database: {
    url: process.env.DATABASE_URL,
  },
  cache: {
    url: process.env.REDIS_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    tokenExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  messaging: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    rabbitMqUrl: process.env.RABBITMQ_URL,
  },
});
`,
        'src/config/env.validation.ts': `import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('debug'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  KAFKA_BROKERS: z.string().optional(),
  RABBITMQ_URL: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
`,
        'src/app.module.ts': `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, envSchema } from './config/index.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: envSchema,
      isGlobal: true,
      expandVariables: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`,
      },
    };
  }
}
