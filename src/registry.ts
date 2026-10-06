import { BaseGenerator } from './generators/base.generator.js';
import { DockerGenerator } from './generators/docker.generator.js';
import { GitGenerator } from './generators/git.generator.js';
import { PrismaGenerator } from './generators/prisma.generator.js';
import { SwaggerGenerator } from './generators/swagger.generator.js';
import type { Generator } from './generators/types.js';

export function getGenerators(): Generator[] {
  return [
    new BaseGenerator(),
    new SwaggerGenerator(),
    new PrismaGenerator(),
    new DockerGenerator(),
    new GitGenerator(),
  ];
}
