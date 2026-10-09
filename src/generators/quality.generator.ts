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
        { name: '@eslint/js', version: VERSIONS.dev.eslintJs, dev: true },
        { name: 'globals', version: VERSIONS.dev.globals, dev: true },
        { name: 'typescript-eslint', version: VERSIONS.dev.typescriptEslint, dev: true },
        { name: 'eslint-config-prettier', version: VERSIONS.dev.eslintConfigPrettier, dev: true },
      );

      scripts['lint'] = 'eslint .';
      scripts['lint:fix'] = 'eslint . --fix';

      files['eslint.config.mjs'] = `import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  eslintConfigPrettier,
);
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
