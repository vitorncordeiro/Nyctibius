import assert from 'node:assert/strict';
import test from 'node:test';

import { getGenerators } from '../src/registry.js';
import { parseProjectOptions } from '../src/project-options.js';

test('it auto-enables Redis when BullMQ is selected', () => {
  const options = parseProjectOptions({
    projectName: 'demo',
    jobs: { provider: 'bullmq' },
    cache: { provider: 'none' },
  });

  assert.equal(options.cache.provider, 'redis');
});

test('it auto-fixes invalid MongoDB + TypeORM combinations', () => {
  const options = parseProjectOptions({
    projectName: 'demo',
    database: {
      provider: 'mongodb',
      orm: 'typeorm',
    },
  });

  assert.equal(options.database.orm, 'mongoose');
});

test('it registers generators for Redis, BullMQ, and JWT support', () => {
  const ids = getGenerators().map((generator) => generator.id);

  assert.ok(ids.includes('redis'));
  assert.ok(ids.includes('bullmq'));
  assert.ok(ids.includes('jwt'));
});
