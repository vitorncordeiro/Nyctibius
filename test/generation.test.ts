import assert from 'node:assert/strict';
import test from 'node:test';

import { assembleProject } from '../src/assembler.js';
import { DEFAULT_OPTIONS } from '../src/types.js';

const options = {
  ...DEFAULT_OPTIONS,
  projectName: 'demo-api',
};

test('it assembles a generated project with core dependencies and env values', () => {
  const { packageJson, envExample, files } = assembleProject(options, [
    {
      dependencies: [{ name: '@nestjs/common', version: '^11.0.0' }],
      scripts: { 'test:smoke': 'node --test' },
      env: [{ name: 'DATABASE_URL', value: 'postgresql://localhost:5432/app' }],
      files: { 'README.md': '# Demo README' },
    },
  ]);

  const packageJsonAny = packageJson as Record<string, any>;

  assert.equal(packageJsonAny.name, 'demo-api');
  assert.ok(packageJsonAny.dependencies && '@nestjs/common' in packageJsonAny.dependencies);
  assert.equal((packageJsonAny.scripts as Record<string, string>)['test:smoke'], 'node --test');
  assert.match(envExample, /DATABASE_URL=postgresql:\/\/localhost:5432\/app/);
  assert.equal(files['README.md'], '# Demo README');
});
