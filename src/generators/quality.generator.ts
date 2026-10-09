import type { Contribution, Generator } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class QualityGenerator implements Generator {
  id = 'quality';

  shouldRun(options: ProjectOptions): boolean {
    return options.quality.eslint || options.quality.prettier || options.quality.husky;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const devDependencies: Array<{ name: string; version: string; dev: boolean }> = [];
    const scripts: Record<string, string> = {};
    const files: Record<string, string> = {};

    if (options.quality.eslint) {
      devDependencies.push(
        { name: 'eslint', version: VERSIONS.dev.eslint, dev: true },
        { name: '@typescript-eslint/eslint-plugin', version: '^7.1.1', dev: true },
        { name: '@typescript-eslint/parser', version: '^7.1.1', dev: true },
        { name: 'eslint-config-prettier', version: '^9.1.0', dev: true },
        { name: 'eslint-plugin-prettier', version: '^5.1.3', dev: true },
      );

      scripts['lint:fix'] = 'eslint . --ext .ts --fix';

      files['.eslintrc.js'] = `module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintignore'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
`;

      files['.eslintignore'] = `node_modules
dist
coverage
.next
.nuxt
*.spec.ts
*.test.ts
`;
    }

    if (options.quality.prettier) {
      devDependencies.push(
        { name: 'prettier', version: VERSIONS.dev.prettier, dev: true },
      );

      scripts['format'] = 'prettier --write "src/**/*.ts" "test/**/*.ts"';
      scripts['format:check'] = 'prettier --check "src/**/*.ts" "test/**/*.ts"';

      files['.prettierrc'] = `{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always"
}
`;

      files['.prettierignore'] = `node_modules
dist
coverage
*.json
*.yaml
.next
.nuxt
`;
    }

    if (options.quality.husky) {
      devDependencies.push(
        { name: 'husky', version: VERSIONS.dev.husky, dev: true },
        { name: 'lint-staged', version: VERSIONS.dev.lintStaged, dev: true },
      );

      files['.husky/pre-commit'] = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`;

      files['.lintstagedrc'] = `{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
`;

      // Make pre-commit executable
      scripts['prepare'] = 'husky install';
    }

    return {
      devDependencies,
      scripts,
      files,
    };
  }
}
