import type { ProjectOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

export interface Preset {
  name: string;
  description: string;
  options: Partial<ProjectOptions>;
}

export const PRESETS: Record<string, Preset> = {
  minimal: {
    name: 'Minimal',
    description: 'Bare minimum NestJS setup with core dependencies',
    options: {
      ...DEFAULT_OPTIONS,
      api: {
        adapter: 'express',
        swagger: false,
        validation: 'none',
        httpClient: 'none',
      },
      database: { provider: 'none', orm: 'none' },
      auth: { provider: 'none', refreshToken: false },
      cache: { provider: 'none' },
      messaging: { provider: 'none' },
      jobs: { provider: 'none' },
      health: false,
      docker: { enabled: false, compose: false },
      git: { initialize: false },
      quality: { eslint: false, prettier: false, husky: false },
      testing: { framework: 'none' },
    },
  },

  'rest-api': {
    name: 'REST API',
    description: 'RESTful API with Prisma, JWT, and Swagger',
    options: {
      ...DEFAULT_OPTIONS,
      api: {
        adapter: 'express',
        swagger: true,
        validation: 'class-validator',
        httpClient: 'none',
      },
      database: { provider: 'postgres', orm: 'prisma' },
      auth: { provider: 'jwt', refreshToken: true },
      cache: { provider: 'none' },
      messaging: { provider: 'none' },
      jobs: { provider: 'none' },
      health: true,
      docker: { enabled: true, compose: true },
      git: { initialize: true },
      quality: { eslint: true, prettier: true, husky: false },
      testing: { framework: 'jest' },
      logging: { provider: 'pino' },
    },
  },

  'production-api': {
    name: 'Production API',
    description: 'Production-ready API with caching, health checks, and comprehensive logging',
    options: {
      ...DEFAULT_OPTIONS,
      api: {
        adapter: 'express',
        swagger: true,
        validation: 'class-validator',
        httpClient: 'none',
      },
      database: { provider: 'postgres', orm: 'prisma' },
      auth: { provider: 'jwt', refreshToken: true },
      cache: { provider: 'redis' },
      messaging: { provider: 'none' },
      jobs: { provider: 'bullmq' },
      health: true,
      docker: { enabled: true, compose: true },
      git: { initialize: true },
      quality: { eslint: true, prettier: true, husky: true },
      testing: { framework: 'jest' },
      logging: { provider: 'pino' },
    },
  },

  microservices: {
    name: 'Microservices',
    description: 'Microservices setup with Kafka, Redis, and BullMQ',
    options: {
      ...DEFAULT_OPTIONS,
      api: {
        adapter: 'express',
        swagger: true,
        validation: 'class-validator',
        httpClient: 'none',
      },
      database: { provider: 'postgres', orm: 'prisma' },
      auth: { provider: 'jwt', refreshToken: true },
      cache: { provider: 'redis' },
      messaging: { provider: 'kafka' },
      jobs: { provider: 'bullmq' },
      health: true,
      docker: { enabled: true, compose: true },
      git: { initialize: true },
      quality: { eslint: true, prettier: true, husky: true },
      testing: { framework: 'jest' },
      logging: { provider: 'pino' },
    },
  },

  'full-backend': {
    name: 'Full Backend',
    description: 'Complete backend stack with all features enabled',
    options: {
      ...DEFAULT_OPTIONS,
      api: {
        adapter: 'express',
        swagger: true,
        validation: 'class-validator',
        httpClient: 'none',
      },
      database: { provider: 'postgres', orm: 'prisma' },
      auth: { provider: 'jwt', refreshToken: true },
      cache: { provider: 'redis' },
      messaging: { provider: 'kafka' },
      jobs: { provider: 'bullmq' },
      health: true,
      docker: { enabled: true, compose: true },
      git: { initialize: true },
      quality: { eslint: true, prettier: true, husky: true },
      testing: { framework: 'jest' },
      logging: { provider: 'pino' },
    },
  },
};

/**
 * Get a preset by name
 */
export function getPreset(name: string): Preset | undefined {
  return PRESETS[name.toLowerCase()];
}

/**
 * List all available presets
 */
export function listPresets(): Preset[] {
  return Object.values(PRESETS);
}

/**
 * Apply a preset to base options
 */
export function applyPreset(
  baseOptions: Partial<ProjectOptions>,
  presetName: string,
): Partial<ProjectOptions> {
  const preset = getPreset(presetName);
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }

  return {
    ...baseOptions,
    ...preset.options,
  };
}
