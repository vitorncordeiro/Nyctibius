# Nyctibius

<p align="center">
  <img src="./nyctibius.svg" alt="Nyctibius logo" width="180" />
</p>

<div align="center">
  <p>
    <a href="./README.md">EN</a> |
    <a href="./README.ptbr.md">PT-BR</a>
  </p>
</div>

Nyctibius is a NestJS project generator designed to speed up the creation of a backend API with a consistent architecture and minimal manual setup.

It follows the idea of an opinionated scaffolding tool: the CLI applies sensible defaults and generates a ready-to-develop project without preventing later customization.

## Overview

The goal of this project is to reduce the time spent on the initial boilerplate of NestJS applications:
- create the project base without relying on `nest new`;
- generate core files deterministically;
- integrate common technologies such as Prisma, Swagger, Docker, Redis, BullMQ, RabbitMQ, Kafka, and JWT;
- support interactive usage and non-interactive CI/CD flows;
- keep the generator and assembler architecture extensible.

## Current status

The CLI foundation is working and the current implementation covers:

- generation of a base NestJS project;
- option validation with Zod;
- automatic dependency resolution (`implies`, `requires`, `conflicts`);
- conditional generation of Swagger and Prisma;
- support for Redis, BullMQ, RabbitMQ, Kafka, and JWT;
- Dockerfile and Compose service generation;
- generation of `.env`, `.env.example`, `.gitignore`, and initial module structure;
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

### Run in interactive mode

When the CLI is executed in an interactive terminal without explicit options, it opens a selection wizard with keyboard navigation. You can also force it explicitly with:

```bash
node dist/index.js --interactive
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
  --cache redis \
  --jobs bullmq \
  --messaging rabbitmq \
  --docker
```

Supported features:

- `--dry-run`
- `--no-install`
- `--database <postgres|mysql|mongodb|none>`
- `--orm <prisma|typeorm|mongoose|none>`
- `--swagger`
- `--auth <jwt|none>`
- `--cache <redis|none>`
- `--jobs <bullmq|none>`
- `--messaging <rabbitmq|kafka|none>`
- `--docker`
- `--package-manager <npm|pnpm|yarn>`

## Dependency rules implemented

The CLI now applies automatic adjustments to maintain a consistent project:

- `BullMQ` automatically enables `Redis`;
- `MongoDB + TypeORM` is corrected to `Mongoose`;
- `database === none` clears `orm`;
- invalid combinations are rejected by validation.

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
│       ├── bullmq.generator.ts
│       ├── docker.generator.ts
│       ├── git.generator.ts
│       ├── jwt.generator.ts
│       ├── kafka.generator.ts
│       ├── prisma.generator.ts
│       ├── rabbitmq.generator.ts
│       ├── redis.generator.ts
│       ├── swagger.generator.ts
│       └── types.ts
├── test/
│   ├── generation.test.ts
│   └── project-options.test.ts
├── package.json
├── tsconfig.json
├── PROJECT.md
├── README.md
├── README.ptbr.md
└── dist/
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

In other words, the developer defines the technological baseline and the CLI generates a project with the basic infrastructure already ready for development.

## Next steps

The evolution continues according to the milestones in `PROJECT.md`, focusing on:

- more complete presets;
- JWT authentication refinement and refresh tokens;
- health checks and observability;
- broader Docker Compose and local service coverage;
- smoke tests for generated projects and deeper validation.

## Contribution

Contributions are welcome. To contribute:

```bash
git checkout -b feature/your-change
npm install
npm run build
npm test
```
