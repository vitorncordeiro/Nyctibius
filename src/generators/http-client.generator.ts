import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class HttpClientGenerator implements Generator {
  id = 'http-client';

  shouldRun(options: ProjectOptions): boolean {
    return options.api.httpClient === 'axios';
  }

  contribute(): Contribution {
    return {
      dependencies: [{ name: '@nestjs/axios', version: VERSIONS.nestjs.axios }],
      moduleImports: ['HttpClientModule'],
      files: {
        'src/http/http-client.module.ts': `import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 500,
    }),
  ],
  exports: [HttpModule],
})
export class HttpClientModule {}
`,
      },
    };
  }
}
