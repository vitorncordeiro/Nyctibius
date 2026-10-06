import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';

export class RedisGenerator implements Generator {
  id = 'redis';

  shouldRun(options: ProjectOptions): boolean {
    return options.cache.provider === 'redis';
  }

  contribute(): Contribution {
    return {
      dependencies: [{ name: 'ioredis', version: '^5.6.1' }],
      env: [{ name: 'REDIS_URL', value: 'redis://localhost:6379' }],
      moduleImports: ['RedisModule'],
      dockerServices: [
        {
          name: 'redis',
          image: 'redis:7-alpine',
          ports: ['"6379:6379"'],
        },
      ],
      files: {
        'src/cache/redis.module.ts': `import { Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
`,
        'src/cache/redis.service.ts': `import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    this.on('error', (error) => {
      console.error('Redis error', error);
    });
  }
}
`,
      },
    };
  }
}
