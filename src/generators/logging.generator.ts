import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class LoggingGenerator implements Generator {
  id = 'logging';

  shouldRun(options: ProjectOptions): boolean {
    return options.logging.provider !== 'nest';
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    if (options.logging.provider === 'pino') {
      return {
        dependencies: [
          { name: 'pino', version: VERSIONS.logging.pino },
          { name: 'pino-http', version: VERSIONS.logging.pinoHttp },
        ],
        env: [
          { name: 'LOG_LEVEL', value: 'debug' },
        ],
        files: {
          'src/common/logger/logger.service.ts': `import { Injectable } from '@nestjs/common';
import { pino } from 'pino';

@Injectable()
export class LoggerService {
  private logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
  });

  log(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }
}
`,
          'src/common/logger/logger.middleware.ts': `import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { pinoHttp } from 'pino-http';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private httpLogger = pinoHttp({
    level: process.env.LOG_LEVEL || 'debug',
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.httpLogger(req, res);
    next();
  }
}
`,
        },
      };
    }

    // Default to NestJS built-in logger
    return {
      files: {
        'src/common/logger/logger.service.ts': `import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class LoggerService {
  private logFile = path.join(process.cwd(), 'logs', 'app.log');

  constructor() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message: string, context?: string): void {
    console.log(\`[\${context || 'LOG'}] \${message}\`);
    this.writeLog(\`LOG - [\${context}] \${message}\`);
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(\`[\${context || 'ERROR'}] \${message}\`, trace);
    this.writeLog(\`ERROR - [\${context}] \${message}\\n\${trace || ''}\`);
  }

  warn(message: string, context?: string): void {
    console.warn(\`[\${context || 'WARN'}] \${message}\`);
    this.writeLog(\`WARN - [\${context}] \${message}\`);
  }

  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(\`[\${context || 'DEBUG'}] \${message}\`);
    }
  }

  verbose(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(\`[\${context || 'VERBOSE'}] \${message}\`);
    }
  }

  private writeLog(message: string): void {
    fs.appendFileSync(
      this.logFile,
      \`[\${new Date().toISOString()}] \${message}\\n\`,
    );
  }
}
`,
      },
    };
  }
}
