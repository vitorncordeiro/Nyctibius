# Nyctibius

Nyctibius is a NestJS project generator designed to speed up the creation of a backend API with a consistent architecture and minimal manual setup.

It follows the idea of an opinionated scaffolding tool: the CLI applies sensible defaults and generates a ready-to-develop project without preventing later customization.

## Overview

The goal of this project is to reduce the time spent on the initial boilerplate of NestJS applications:

- create the project base without relying on `nest new`;
- generate core files deterministically;
- integrate common technologies such as Prisma, Swagger, Docker, and JWT authentication;
- support interactive usage and non-interactive CI/CD flows;
- keep the generator and assembler architecture extensible.

## Current status

This repository is in its early implementation phase, with the CLI foundation already working and the generation architecture structured according to the proposal in `PROJECT.md`.

The current implementation includes:

- generation of a base NestJS project;
- option validation with Zod;
- conditional generation of Swagger and Prisma;
- Dockerfile and docker-compose generation;
- generation of `.env`, `.env.example`, and `.gitignore`;
- `--dry-run` support;
- project generation in a new directory with `--no-install`.

## How to use it

### Install dependencies

```bash
npm install
```

### Build the CLI

```bash
npm run build
```

### Run a dry run

```bash
node dist/index.js --dry-run demo-api --package-manager npm
```

### Generate a real project

```bash
node dist/index.js demo-api --package-manager npm --no-install
```

### CLI help

```bash
node dist/index.js --help
```

## Main options

```bash
node dist/index.js <project-name> \
  --package-manager npm \
  --database postgres \
  --orm prisma \
  --swagger \
  --auth jwt \
  --redis \
  --docker
```

Supported features:

- `--dry-run`
- `--no-install`
- `--database <postgres|mysql|mongodb|none>`
- `--orm <prisma|typeorm|mongoose|none>`
- `--swagger`
- `--auth <jwt|none>`
- `--redis`
- `--docker`
- `--package-manager <npm|pnpm|yarn>`

## Project structure

```text
nyctibius/
├── src/
│   ├── assembler.ts
│   ├── index.ts
│   ├── project-options.ts
│   ├── registry.ts
│   ├── types.ts
│   └── generators/
│       ├── base.generator.ts
│       ├── docker.generator.ts
│       ├── git.generator.ts
│       ├── prisma.generator.ts
│       ├── swagger.generator.ts
│       └── types.ts
├── test/
│   └── generation.test.ts
├── package.json
├── tsconfig.json
├── PROJECT.md
├── README.md
└── README.en.md
```

## Generation flow

The architecture follows the plan described in `PROJECT.md`:

1. CLI collects options;
2. Zod validation runs;
3. automatic dependency resolution occurs;
4. generators execute;
5. contributions are merged by the assembler;
6. final files are written;
7. dependency installation and post-generation steps happen.

## Project goal

Nyctibius aims to answer a simple need:

> choose the architecture and let the tool handle the heavy boilerplate.

In other words, the developer defines the technological baseline and the CLI generates the project with the basic infrastructure already ready for development.

## Next steps

The planned evolution follows the milestones in `PROJECT.md`, including:

- complete preset support;
- full JWT authentication support;
- Redis, RabbitMQ, and BullMQ;
- PostgreSQL/MySQL/MongoDB with dependency rules;
- health checks, logging, and broader Docker Compose support;
- generation tests with real builds of generated projects.

## Contribution

Contributions are welcome. To contribute:

```bash
git checkout -b feature/your-change
npm install
npm run build
npm test
```
