import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';

export class RabbitMqGenerator implements Generator {
  id = 'rabbitmq';

  shouldRun(options: ProjectOptions): boolean {
    return options.messaging.provider === 'rabbitmq';
  }

  contribute(): Contribution {
    return {
      dependencies: [{ name: '@nestjs/microservices', version: '^11.0.0' }],
      env: [{ name: 'RABBITMQ_URL', value: 'amqp://localhost:5672' }],
      moduleImports: ['RabbitMqModule'],
      dockerServices: [
        {
          name: 'rabbitmq',
          image: 'rabbitmq:4-management',
          ports: ['"5672:5672"', '"15672:15672"'],
        },
      ],
      files: {
        'src/messaging/rabbitmq/rabbitmq.module.ts': `import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: 'main',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
})
export class RabbitMqModule {}
`,
      },
    };
  }
}
