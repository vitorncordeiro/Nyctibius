import { confirm, intro, isCancel, select, text } from '@clack/prompts';

import { DEFAULT_OPTIONS, type ProjectOptions } from './types.js';
import { listPresets, applyPreset } from './presets.js';

export type SelectOption<T extends string | boolean> = {
  value: T;
  label: string;
  hint?: string;
};

function isInteractiveInputAvailable(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function promptText(message: string, defaultValue: string): Promise<string> {
  if (!isInteractiveInputAvailable()) {
    return defaultValue;
  }

  const result = await text({
    message,
    placeholder: defaultValue,
    defaultValue,
  });

  if (typeof result === 'symbol' || result === '') {
    throw new Error('Prompt cancelled.');
  }

  return result.trim() || defaultValue;
}

async function promptSelect<T extends string | boolean>(
  message: string,
  options: readonly SelectOption<T>[],
  defaultValue: T,
): Promise<T> {
  if (!isInteractiveInputAvailable()) {
    return defaultValue;
  }

  const result = await select({
    message,
    options: options as any,
    initialValue: defaultValue as any,
    showInstructions: true,
  });

  if (isCancel(result)) {
    throw new Error('Prompt cancelled.');
  }

  return result as T;
}

async function promptBoolean(message: string, defaultValue: boolean): Promise<boolean> {
  if (!isInteractiveInputAvailable()) {
    return defaultValue;
  }

  const result = await confirm({
    message,
    initialValue: defaultValue,
  });

  if (isCancel(result)) {
    throw new Error('Prompt cancelled.');
  }

  return result;
}

export async function promptProjectConfiguration(
  current: Partial<ProjectOptions>,
): Promise<Partial<ProjectOptions>> {
  intro('Nyctibius');

  // Ask about using a preset first
  const presets = listPresets();
  const presetSelection = await promptSelect(
    'Start with a preset?',
    [
      { value: '', label: 'Custom configuration' },
      ...presets.map((p) => ({
        value: p.name.toLowerCase().replace(/ /g, '-'),
        label: p.name,
        hint: p.description,
      })),
    ],
    '',
  );

  // If a preset was selected, apply it and ask for confirmation
  if (presetSelection) {
    const presetOptions = applyPreset(current, presetSelection);
    const confirmPreset = await promptBoolean(
      `Use ${presets.find((p) => p.name.toLowerCase().replace(/ /g, '-') === presetSelection)?.name} preset?`,
      true,
    );

    if (confirmPreset) {
      current = presetOptions;
    }
  }

  const projectName = await promptText('Project name', current.projectName ?? 'my-api');
  const packageManager = await promptSelect(
    'Package manager',
    [
      { value: 'npm', label: 'npm' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'yarn', label: 'yarn' },
    ],
    current.packageManager ?? DEFAULT_OPTIONS.packageManager,
  );

  const databaseProvider = await promptSelect(
    'Database',
    [
      { value: 'postgres', label: 'PostgreSQL', hint: 'Relational' },
      { value: 'mysql', label: 'MySQL', hint: 'Relational' },
      { value: 'mongodb', label: 'MongoDB', hint: 'Document' },
      { value: 'none', label: 'None' },
    ],
    current.database?.provider ?? DEFAULT_OPTIONS.database.provider,
  );

  const ormChoices = [
    { value: 'prisma', label: 'Prisma', hint: 'Modern ORM' },
    { value: 'typeorm', label: 'TypeORM', hint: 'Class-based' },
    { value: 'mongoose', label: 'Mongoose', hint: 'MongoDB' },
    { value: 'none', label: 'None' },
  ] as const;

  const ormSelection =
    databaseProvider === 'none'
      ? 'none'
      : await promptSelect(
          'ORM / ODM',
          ormChoices,
          current.database?.orm ?? DEFAULT_OPTIONS.database.orm,
        );

  const swagger = await promptBoolean('API documentation (Swagger)', current.api?.swagger ?? DEFAULT_OPTIONS.api.swagger);
  const validationSelection = await promptSelect(
    'Validation',
    [
      { value: 'class-validator', label: 'class-validator' },
      { value: 'zod', label: 'Zod' },
      { value: 'none', label: 'None' },
    ],
    current.api?.validation ?? DEFAULT_OPTIONS.api.validation,
  );
  const authSelection = await promptSelect(
    'Authentication',
    [
      { value: 'jwt', label: 'JWT + Passport' },
      { value: 'none', label: 'None' },
    ],
    current.auth?.provider ?? DEFAULT_OPTIONS.auth.provider,
  );

  const cacheSelection = await promptSelect(
    'Cache',
    [
      { value: 'redis', label: 'Redis' },
      { value: 'none', label: 'None' },
    ],
    current.cache?.provider ?? DEFAULT_OPTIONS.cache.provider,
  );

  const messagingSelection = await promptSelect(
    'Message broker',
    [
      { value: 'rabbitmq', label: 'RabbitMQ' },
      { value: 'kafka', label: 'Kafka' },
      { value: 'none', label: 'None' },
    ],
    current.messaging?.provider ?? DEFAULT_OPTIONS.messaging.provider,
  );

  const jobsSelection = await promptSelect(
    'Background jobs',
    [
      { value: 'bullmq', label: 'BullMQ' },
      { value: 'none', label: 'None' },
    ],
    current.jobs?.provider ?? DEFAULT_OPTIONS.jobs.provider,
  );

  const dockerEnabled = await promptBoolean(
    'Docker support',
    current.docker?.enabled ?? DEFAULT_OPTIONS.docker.enabled,
  );

  const gitEnabled = await promptBoolean(
    'Initialize git repository',
    current.git?.initialize ?? DEFAULT_OPTIONS.git.initialize,
  );

  const eslintEnabled = await promptBoolean(
    'Enable ESLint',
    current.quality?.eslint ?? DEFAULT_OPTIONS.quality.eslint,
  );

  const prettierEnabled = await promptBoolean(
    'Enable Prettier',
    current.quality?.prettier ?? DEFAULT_OPTIONS.quality.prettier,
  );

  const huskyEnabled = await promptBoolean(
    'Enable Husky (git hooks)',
    current.quality?.husky ?? DEFAULT_OPTIONS.quality.husky,
  );

  const testingFramework = await promptSelect(
    'Testing framework',
    [
      { value: 'jest', label: 'Jest' },
      { value: 'vitest', label: 'Vitest' },
      { value: 'none', label: 'None' },
    ],
    current.testing?.framework ?? DEFAULT_OPTIONS.testing.framework,
  );

  const loggingProvider = await promptSelect(
    'Logging provider',
    [
      { value: 'pino', label: 'Pino' },
      { value: 'winston', label: 'Winston' },
      { value: 'nest', label: 'NestJS Built-in' },
    ],
    current.logging?.provider ?? DEFAULT_OPTIONS.logging.provider,
  );

  return {
    projectName,
    packageManager,
    api: {
      ...DEFAULT_OPTIONS.api,
      swagger,
      validation: validationSelection,
    },
    database: {
      provider: databaseProvider,
      orm: ormSelection,
    },
    auth: {
      ...DEFAULT_OPTIONS.auth,
      provider: authSelection,
    },
    cache: {
      provider: cacheSelection,
    },
    messaging: {
      provider: messagingSelection,
    },
    jobs: {
      provider: jobsSelection,
    },
    health: true,
    logging: {
      provider: loggingProvider,
    },
    docker: {
      ...DEFAULT_OPTIONS.docker,
      enabled: dockerEnabled,
    },
    git: {
      ...DEFAULT_OPTIONS.git,
      initialize: gitEnabled,
    },
    quality: {
      eslint: eslintEnabled,
      prettier: prettierEnabled,
      husky: huskyEnabled,
    },
    testing: {
      framework: testingFramework,
    },
  };
}
