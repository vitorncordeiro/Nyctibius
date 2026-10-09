import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class SecurityGenerator implements Generator {
  id = 'security';

  shouldRun(): boolean {
    return true;
  }

  contribute(): Contribution {
    return {
      dependencies: [
        { name: 'helmet', version: '^8.3.0' },
        { name: '@nestjs/throttler', version: VERSIONS.nestjs.throttler },
      ],
      files: {
        'src/common/middleware/security.middleware.ts': `import { Injectable } from '@nestjs/common';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware {
  static use(): ReturnType<typeof helmet> {
    return helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    });
  }
}
`,
      },
      bootstrapHooks: [
        "import helmet from 'helmet';",
        'app.use(helmet({ contentSecurityPolicy: false }));',
      ],
    };
  }
}
