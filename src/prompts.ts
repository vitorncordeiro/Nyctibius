import { confirm, intro, isCancel, select, text } from '@clack/prompts';

import { DEFAULT_OPTIONS, type ProjectOptions } from './types.js';

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
    docker: {
      ...DEFAULT_OPTIONS.docker,
      enabled: dockerEnabled,
    },
    git: {
      ...DEFAULT_OPTIONS.git,
      initialize: gitEnabled,
    },
  };
}
