import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class HealthCheckGenerator implements Generator {
  id = 'health';

  shouldRun(options: ProjectOptions): boolean {
    return options.health;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const healthChecks: string[] = [];

    if (options.database.provider !== 'none') {
      healthChecks.push('TypeOrmHealthIndicator');
    }

    if (options.cache.provider === 'redis') {
      healthChecks.push('RedisHealthIndicator');
    }

    const healthCheckService = `import { Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator${healthChecks.length > 0 ? ', ' + healthChecks.join(', ') : ''} } from '@nestjs/terminus';

@Injectable()
export class HealthIndicatorService {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    ${healthChecks.map((check) => `private ${check[0].toLowerCase()}${check.slice(1)}: ${check}`).join(',\n    ')}
  ) {}

  check() {
    return this.health.check([
      () => this.http.pingCheck('api', \`\${process.env.APP_URL || 'http://localhost:3000'}/api/health\`),
    ]);
  }
}
`;

    return {
      dependencies: [
        { name: '@nestjs/axios', version: VERSIONS.nestjs.axios },
        { name: '@nestjs/terminus', version: VERSIONS.nestjs.terminus },
      ],
      moduleImports: ['TerminusModule', 'HealthModule'],
      files: {
        'src/health/health.module.ts': `import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller.js';
import { HealthIndicatorService } from './health.indicator.service.js';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [HealthIndicatorService],
})
export class HealthModule {}
`,
        'src/health/health.controller.ts': `import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('api', 'http://localhost:3000'),
    ]);
  }
}
`,
        'src/health/health.indicator.service.ts': healthCheckService,
      },
    };
  }
}
