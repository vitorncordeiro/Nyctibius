import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class KafkaGenerator implements Generator {
  id = 'kafka';

  shouldRun(options: ProjectOptions): boolean {
    return options.messaging.provider === 'kafka';
  }

  contribute(): Contribution {
    return {
      dependencies: [{ name: '@nestjs/microservices', version: VERSIONS.nestjs.microservices }],
      env: [
        { name: 'KAFKA_BROKERS', value: 'localhost:9092' },
        { name: 'KAFKA_CLIENT_ID', value: 'nyctibius-client' },
      ],
      moduleImports: ['KafkaModule'],
      dockerServices: [
        {
          name: 'kafka',
          image: 'bitnami/kafka:3.9',
          ports: ['"9092:9092"'],
          environment: [
            'KAFKA_CFG_NODE_ID=1',
            'KAFKA_CFG_PROCESS_ROLES=controller,broker',
            'KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093',
            'KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092',
            'KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT',
            'KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093',
            'KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1',
            'KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1',
            'KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=1',
          ],
        },
      ],
      files: {
        'src/messaging/kafka/kafka.module.ts': `import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID ?? 'nyctibius-client',
            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
          },
          consumer: {
            groupId: 'nyctibius-group',
          },
        },
      },
    ]),
  ],
})
export class KafkaModule {}
`,
      },
    };
  }
}
