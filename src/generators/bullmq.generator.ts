import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';

export class BullMqGenerator implements Generator {
  id = 'bullmq';

  shouldRun(options: ProjectOptions): boolean {
    return options.jobs.provider === 'bullmq';
  }

  contribute(): Contribution {
    return {
      dependencies: [
        { name: 'bullmq', version: '^5.0.0' },
        { name: '@nestjs/bullmq', version: '^11.0.0' },
      ],
      env: [{ name: 'REDIS_URL', value: 'redis://localhost:6379' }],
      moduleImports: ['JobsModule'],
      files: {
        'src/jobs/jobs.module.ts': `import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
  ],
})
export class JobsModule {}
`,
        'src/jobs/example.processor.ts': `import { Processor, Process } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

@Processor('default')
export class ExampleProcessor {
  @Process('default')
  async handle(job: Job): Promise<void> {
    console.log('Processing job', job.name);
  }
}
`,
      },
    };
  }
}
