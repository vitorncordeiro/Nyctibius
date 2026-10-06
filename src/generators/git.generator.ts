import type { Generator, Contribution } from './types.js';
import type { ProjectOptions } from '../types.js';

export class GitGenerator implements Generator {
  id = 'git';

  shouldRun(options: ProjectOptions): boolean {
    return options.git.initialize;
  }

  contribute(): Contribution {
    return {
      files: {
        '.gitignore': `node_modules
.env
.env.local
.env.*
!.env.example
dist
coverage
`,
      },
    };
  }
}
