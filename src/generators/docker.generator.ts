import type { Generator, Contribution, DockerService } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class DockerGenerator implements Generator {
  id = 'docker';

  shouldRun(options: ProjectOptions): boolean {
    return options.docker.enabled;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const services: DockerService[] = [
      {
        name: 'api',
        build: '.',
        image: `${options.projectName || 'nyctibius'}-api:latest`,
        ports: ['"3000:3000"'],
        environment: ['NODE_ENV=development', 'PORT=3000'],
        dependsOn: [] as string[],
        networks: ['nyctibius-network'],
      },
    ];

    const dependencies: string[] = [];

    if (options.database.provider !== 'none') {
      dependencies.push('db');
    }
    if (options.cache.provider === 'redis') {
      dependencies.push('redis');
    }
    if (options.messaging.provider === 'rabbitmq') {
      dependencies.push('rabbitmq');
    }
    if (options.messaging.provider === 'kafka') {
      dependencies.push('zookeeper', 'kafka');
    }

    services[0].dependsOn = dependencies;

    if (options.database.provider === 'postgres') {
      services.push({
        name: 'db',
        image: VERSIONS.docker.postgres,
        ports: ['"5432:5432"'],
        environment: ['POSTGRES_DB=app', 'POSTGRES_USER=postgres', 'POSTGRES_PASSWORD=postgres'],
        volumes: ['postgres-data:/var/lib/postgresql/data'],
        healthcheck: '{ test: ["CMD-SHELL", "pg_isready -U postgres -d app"], interval: 10s, timeout: 5s, retries: 5 }',
        networks: ['nyctibius-network'],
      });
    }

    if (options.cache.provider === 'redis') {
      services.push({
        name: 'redis',
        image: VERSIONS.docker.redis,
        ports: ['"6379:6379"'],
        volumes: ['redis-data:/data'],
        healthcheck: '{ test: ["CMD", "redis-cli", "ping"], interval: 10s, timeout: 5s, retries: 5 }',
        networks: ['nyctibius-network'],
      });
    }

    if (options.messaging.provider === 'rabbitmq') {
      services.push({
        name: 'rabbitmq',
        image: VERSIONS.docker.rabbitmq,
        ports: ['"5672:5672"', '"15672:15672"'],
        volumes: ['rabbitmq-data:/var/lib/rabbitmq'],
        healthcheck: '{ test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"], interval: 10s, timeout: 5s, retries: 5 }',
        networks: ['nyctibius-network'],
      });
    }

    if (options.messaging.provider === 'kafka') {
      services.push(
        {
          name: 'zookeeper',
          image: 'bitnami/zookeeper:3.9',
          environment: ['ALLOW_ANONYMOUS_LOGIN=yes'],
          ports: ['"2181:2181"'],
          networks: ['nyctibius-network'],
        },
        {
          name: 'kafka',
          image: VERSIONS.docker.kafka,
          ports: ['"9092:9092"'],
          environment: [
            'KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181',
            'ALLOW_PLAINTEXT_LISTENER=yes',
            'KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092',
          ],
          dependsOn: ['zookeeper'],
          healthcheck: '{ test: ["CMD-SHELL", "kafka-topics --bootstrap-server localhost:9092 --list >/dev/null 2>&1 || exit 1"], interval: 10s, timeout: 10s, retries: 10 }',
          networks: ['nyctibius-network'],
        },
      );
    }

    return {
      dockerServices: options.docker.compose ? services : [],
      files: {
        'Dockerfile': `FROM ${VERSIONS.docker.nodeAlpine} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM ${VERSIONS.docker.nodeAlpine}
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
`,
        '.dockerignore': `node_modules
npm-debug.log
dist
.git
.env
.env.local
coverage
`,
      },
    };
  }
}
