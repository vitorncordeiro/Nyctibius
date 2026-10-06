import type { ProjectOptions } from '../types.js';

export interface Dependency {
  name: string;
  version: string;
  dev?: boolean;
}

export interface EnvVar {
  name: string;
  value: string;
}

export interface DockerService {
  name: string;
  image: string;
  ports?: string[];
  environment?: string[];
  volumes?: string[];
  healthcheck?: string;
  dependsOn?: string[];
}

export interface Contribution {
  dependencies?: Dependency[];
  devDependencies?: Dependency[];
  scripts?: Record<string, string>;
  env?: EnvVar[];
  dockerServices?: DockerService[];
  moduleImports?: string[];
  bootstrapHooks?: string[];
  files?: Record<string, string>;
  postGeneration?: string[];
}

export interface GeneratorContext {
  options: ProjectOptions;
}

export interface Generator {
  id: string;
  shouldRun(options: ProjectOptions): boolean;
  contribute(context: GeneratorContext): Promise<Contribution> | Contribution;
}
