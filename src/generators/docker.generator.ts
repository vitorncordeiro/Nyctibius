import type { Generator, Contribution, DockerService } from './types.js';
import type { ProjectOptions } from '../types.js';
import { VERSIONS } from '../versions.js';

export class DockerGenerator implements Generator {
  id = 'docker';

  shouldRun(options: ProjectOptions): boolean {
    return options.docker.enabled;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const services: DockerService[] = [
      {
        name: 'api',
        image: VERSIONS.docker.nodeAlpine,
        ports: ['"3000:3000"'],
        dependsOn: options.database.provider !== 'none' ? ['db'] : [],
      },
    ];

    if (options.database.provider === 'postgres') {
      services.push({
        name: 'db',
        image: VERSIONS.docker.postgres,
        ports: ['"5432:5432"'],
        environment: ['POSTGRES_DB=app', 'POSTGRES_USER=postgres', 'POSTGRES_PASSWORD=postgres'],
        volumes: ['postgres-data:/var/lib/postgresql/data'],
      });
    }

    return {
      dockerServices: services,
      files: {
        'Dockerfile': `FROM ${VERSIONS.docker.nodeAlpine} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM ${VERSIONS.docker.nodeAlpine}
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
`,
        '.dockerignore': `node_modules
npm-debug.log
dist
.git
.env
`,
      },
    };
  }
}
