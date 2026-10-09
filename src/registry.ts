import { BaseGenerator } from './generators/base.generator.js';
import { BullMqGenerator } from './generators/bullmq.generator.js';
import { ConfigurationGenerator } from './generators/configuration.generator.js';
import { DockerGenerator } from './generators/docker.generator.js';
import { GitGenerator } from './generators/git.generator.js';
import { HealthCheckGenerator } from './generators/health.generator.js';
import { JwtGenerator } from './generators/jwt.generator.js';
import { KafkaGenerator } from './generators/kafka.generator.js';
import { LoggingGenerator } from './generators/logging.generator.js';
import { PrismaGenerator } from './generators/prisma.generator.js';
import { QualityGenerator } from './generators/quality.generator.js';
import { RabbitMqGenerator } from './generators/rabbitmq.generator.js';
import { RedisGenerator } from './generators/redis.generator.js';
import { SecurityGenerator } from './generators/security.generator.js';
import { SwaggerGenerator } from './generators/swagger.generator.js';
import { TestingGenerator } from './generators/testing.generator.js';
import type { Generator } from './generators/types.js';

export function getGenerators(): Generator[] {
  return [
    new BaseGenerator(),
    new ConfigurationGenerator(),
    new LoggingGenerator(),
    new SecurityGenerator(),
    new SwaggerGenerator(),
    new PrismaGenerator(),
    new RedisGenerator(),
    new BullMqGenerator(),
    new RabbitMqGenerator(),
    new KafkaGenerator(),
    new JwtGenerator(),
    new HealthCheckGenerator(),
    new TestingGenerator(),
    new QualityGenerator(),
    new DockerGenerator(),
    new GitGenerator(),
  ];
}
