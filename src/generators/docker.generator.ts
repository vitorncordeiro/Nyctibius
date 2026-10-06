import type { Generator, Contribution, DockerService } from './types.js';
import type { ProjectOptions } from '../types.js';

export class DockerGenerator implements Generator {
  id = 'docker';

  shouldRun(options: ProjectOptions): boolean {
    return options.docker.enabled;
  }

  contribute({ options }: { options: ProjectOptions }): Contribution {
    const services: DockerService[] = [
      {
        name: 'api',
        image: 'node:22-alpine',
        ports: ['"3000:3000"'],
        dependsOn: options.database.provider !== 'none' ? ['db'] : [],
      },
    ];

    if (options.database.provider === 'postgres') {
      services.push({
        name: 'db',
        image: 'postgres:17',
        ports: ['"5432:5432"'],
        environment: ['POSTGRES_DB=app', 'POSTGRES_USER=postgres', 'POSTGRES_PASSWORD=postgres'],
        volumes: ['postgres-data:/var/lib/postgresql/data'],
      });
    }

    return {
      dockerServices: services,
      files: {
        'Dockerfile': `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
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
