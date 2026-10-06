# Nyctibius

> Um project initializer opinado para NestJS, inspirado no Spring Initializr.

## 1. Visão

O **Nyctibius** é uma CLI para criação e inicialização de projetos NestJS.

Seu objetivo é eliminar o trabalho repetitivo de configurar a infraestrutura inicial de uma aplicação backend, permitindo que o desenvolvedor escolha, de forma interativa ou declarativa, quais tecnologias deseja utilizar.

Em vez de:

```bash
nest new my-api

npm install @nestjs/config
npm install @nestjs/swagger
npm install @nestjs/jwt
npm install prisma
npm install ioredis
npm install ...
```

o desenvolvedor poderá executar:

```bash
npx nyctibius
```

e selecionar as características do projeto.

O Nyctibius deverá instalar as dependências, criar a estrutura inicial, configurar os módulos e gerar os arquivos auxiliares necessários.

---

## Status da implementação atual

A base do MVP foi implementada e validada em código.

- [x] CLI de geração funcional com `--dry-run`, `--no-install` e flags declarativas
- [x] `ProjectOptions`, `Generator`, `Contribution` e montagem via assembler
- [x] Base NestJS gerada com TypeScript e estrutura inicial
- [x] Configuração de ambiente com validação via `zod`
- [x] Swagger gerado de forma condicional
- [x] Prisma gerado por provider e scripts compatíveis
- [x] Redis, BullMQ, RabbitMQ e Kafka como generators independentes
- [x] JWT + Passport como módulo gerado
- [x] Dockerfile e Compose gerados dinamicamente
- [x] `.env`, `.env.example` e `.gitignore` produzidos
- [x] Resolução automática de dependências (`implies`, `requires`, `conflicts`)
- [x] Testes focados para geração e validação de opções
- [x] Build TypeScript funcionando

# 2. Objetivos

## Objetivos principais

- Criar projetos NestJS rapidamente.
- Reduzir configuração manual inicial.
- Padronizar a arquitetura dos projetos.
- Permitir escolha de tecnologias através de um wizard.
- Gerar configurações funcionais, não apenas instalar pacotes.
- Gerar infraestrutura local através de Docker Compose.
- Permitir presets para cenários comuns.
- Permitir configuração não interativa para CI/CD e automação.
- Ser extensível para novas tecnologias.

## Não objetivos inicialmente

O Nyctibius não pretende:

- Substituir o Nest CLI.
- Ser um framework.
- Gerenciar o projeto depois de criado.
- Ser um gerenciador de dependências.
- Provisionar infraestrutura cloud.
- Gerenciar deploys de produção.

O foco é:

> **Do zero ao projeto NestJS pronto para começar o desenvolvimento.**

---

# 3. Experiência esperada

Execução:

```bash
npx nyctibius
```

Fluxo:

```text
╭────────────────────────────────────────╮
│              Nyctibius                 │
│     NestJS Project Initializer         │
╰────────────────────────────────────────╯

? Project name: soundflow-api

? Package manager:
❯ npm
  pnpm
  yarn

? API adapter:
❯ Express
  Fastify

? Database:
❯ PostgreSQL
  MySQL
  MongoDB
  None

? ORM / ODM:
❯ Prisma
  TypeORM
  Mongoose
  None

? API Documentation:
❯ Swagger
  None

? Validation:
❯ class-validator
  Zod
  None

? Authentication:
❯ JWT + Passport
  None

? Cache:
❯ Redis
  None

? Message Broker:
❯ RabbitMQ
  Kafka
  None

? Background Jobs:
❯ BullMQ
  None

? Logging:
❯ Pino
  Winston
  Nest Logger

? Health checks:
❯ Terminus
  None

? Docker:
❯ Dockerfile + Docker Compose
  Dockerfile only
  None

? Git:
❯ Initialize repository
  None

[ok] Project created successfully.
```

Observação: as listas acima mostram todas as opções previstas. O wizard deve exibir apenas as opções válidas para as escolhas já feitas (por exemplo, após escolher PostgreSQL, a opção Mongoose não aparece).

---

# 4. Princípios

## 4.1 Convention over configuration

O Nyctibius deve tomar decisões sensatas quando possível.

Não perguntar algo que possa ser inferido de uma escolha anterior.

Exemplo:

```text
Database: PostgreSQL
ORM: Prisma
```

deve automaticamente habilitar:

```text
DATABASE_URL
PrismaService
prisma/schema.prisma
```

---

## 4.2 Dependências devem gerar configuração

Selecionar Redis não deve apenas executar:

```bash
npm install ioredis
```

Deve gerar a integração correspondente:

```text
src/
└── cache/
    ├── cache.module.ts
    └── redis.service.ts
```

Além de:

```env
REDIS_URL=redis://localhost:6379
```

e, se Docker estiver habilitado, o serviço Redis no Compose.

---

## 4.3 Opinião sem impedir customização

O Nyctibius deve ter defaults fortes, mas permitir que o usuário escolha.

Exemplo:

```text
Redis
```

deve possuir uma configuração padrão funcional, mas o desenvolvedor deve poder alterá-la posteriormente.

---

## 4.4 Dependências entre escolhas

Algumas tecnologias dependem de outras.

Exemplo:

```text
BullMQ
   ↓
Redis
```

Se o usuário selecionar BullMQ:

```text
[info] BullMQ requires Redis.
[ok] Redis has been enabled automatically.
```

Outro exemplo:

```text
PostgreSQL / MySQL
   ↓
Prisma / TypeORM
```

MongoDB:

```text
MongoDB
   ↓
Prisma / Mongoose
```

O wizard deve impedir combinações inválidas. As relações entre escolhas seguem as três categorias definidas na seção 30 (`implies`, `requires` e `conflicts`).

## 4.5 Determinismo

Dadas as mesmas opções, o Nyctibius deve gerar sempre o mesmo projeto. Versões de dependências e de imagens Docker são fixadas pelo próprio Nyctibius (ver seções 19 e 32), sem uso de `latest`.

---

# 5. Project

Perguntas:

```text
Project name
Package manager
Node version
Package scope
```

Possíveis configurações:

```text
npm
pnpm
yarn
```

Gerar:

```text
.nvmrc
package.json
```

Opcionalmente:

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

## 5.1 Base do projeto

O Nyctibius **gera a base do projeto por conta própria**, em vez de delegar ao `nest new`.

Motivos:

- execução mais rápida e determinística;
- controle total sobre adapter, linter, framework de testes e estrutura de pastas;
- ausência de dependência de saída interativa de outra CLI.

Consequência: o Nyctibius assume a manutenção das versões da base. Deve existir um job periódico (CI agendado) que atualiza as versões, gera os projetos da matriz de testes e valida que continuam compilando.

## 5.2 Config (core)

`@nestjs/config` faz parte do core, sempre habilitado.

O Nyctibius deve gerar, junto com ele, a **validação do schema de variáveis de ambiente** (Zod ou Joi), de forma que a aplicação falhe na inicialização caso uma variável obrigatória esteja ausente ou inválida.

```text
src/
└── config/
    ├── configuration.ts
    └── env.validation.ts
```

O schema de validação é composto a partir das contribuições de cada tecnologia selecionada (seção 29).

---

# 6. API

## Adapter

Opções:

```text
Express
Fastify
```

O adapter altera o `main.ts`, o suporte a Swagger e a integração de alguns módulos. Esses pontos devem ser tratados como contribuições condicionais ao adapter, e não como templates duplicados por combinação.

## Documentation

```text
Swagger
None
```

Se Swagger:

Gerar configuração em:

```text
src/config/swagger.ts
```

e inicialização no:

```text
src/main.ts
```

Com Fastify, o Swagger exige pacotes adicionais e uma inicialização diferente da usada com Express. O generator deve cobrir os dois casos.

---

# 7. Validation

Opções:

```text
class-validator
Zod
None
```

Para `class-validator`:

```text
ValidationPipe
class-transformer
class-validator
```

Configurar automaticamente no `main.ts`.

Para `Zod`:

O Nyctibius deve usar a biblioteca `nestjs-zod` (ou um pipe próprio equivalente) e ajustar a integração com o Swagger, que muda quando os DTOs são derivados de schemas Zod. A decisão final de biblioteca deve ser tomada antes de oferecer a opção no wizard. Até lá, a opção Zod fica fora do MVP.

---

# 8. Database

Opções:

```text
PostgreSQL
MySQL
MongoDB
None
```

A escolha do banco influencia as opções seguintes.

## PostgreSQL / MySQL

ORM:

```text
Prisma
TypeORM
None
```

## MongoDB

ODM/ORM:

```text
Prisma
Mongoose
None
```

Observação: o Prisma com MongoDB possui limitações próprias (não utiliza o fluxo tradicional de migrations). Os scripts `db:*` do template precisam variar conforme o provider.

---

# 9. Prisma

Se selecionado:

Gerar:

```text
prisma/
└── schema.prisma

src/
└── database/
    ├── prisma.module.ts
    └── prisma.service.ts
```

Adicionar:

```env
DATABASE_URL=
```

Scripts:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

Antes de fixar a versão do Prisma, validar o fluxo de configuração dessa versão (arquivo de configuração do Prisma e uso de driver adapters), pois isso altera o template do `PrismaService` e do `schema.prisma`.

---

# 10. TypeORM

Gerar:

```text
src/
└── database/
    ├── database.module.ts
    └── migrations/
```

Configuração baseada em:

```env
DATABASE_URL=
```

ou variáveis específicas:

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
```

O Nyctibius deve escolher uma das duas formas como padrão e usá-la de maneira consistente em todos os templates.

---

# 11. Authentication

Opções:

```text
JWT + Passport
None
```

Se JWT:

```text
src/
└── auth/
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.controller.ts
    ├── guards/
    ├── strategies/
    └── decorators/
```

Pergunta adicional:

```text
? Token strategy
❯ Access + Refresh Token
  Access Token only
```

O segredo JWT é tratado conforme a seção 35 (gerado localmente de forma aleatória, nunca versionado).

Possibilidade futura:

```text
OAuth2
OpenID Connect
```

---

# 12. Cache

Opções:

```text
Redis
None
```

Se Redis:

```text
src/
└── cache/
    ├── cache.module.ts
    └── redis.service.ts
```

Gerar:

```env
REDIS_URL=redis://localhost:6379
```

Adicionar serviço ao Docker Compose.

---

# 13. Message Broker

Opções:

```text
RabbitMQ
Kafka
None
```

## RabbitMQ

Gerar:

```text
src/
└── messaging/
    └── rabbitmq/
        ├── rabbitmq.module.ts
        ├── rabbitmq.service.ts
        └── ...
```

Adicionar:

```env
RABBITMQ_URL=
```

Docker:

```yaml
rabbitmq:
  image: rabbitmq:4-management
```

## Kafka

Gerar integração equivalente.

Adicionar:

```env
KAFKA_BROKERS=
KAFKA_CLIENT_ID=
```

O Docker Compose deve usar Kafka em **modo KRaft**, sem Zookeeper, para reduzir o número de serviços e a complexidade do ambiente local.

---

# 14. Background Jobs

Opções:

```text
BullMQ
None
```

BullMQ implica Redis (`implies`, ver seção 30).

Gerar:

```text
src/
└── jobs/
    ├── jobs.module.ts
    ├── queues/
    └── processors/
```

Adicionar:

```env
REDIS_URL=
```

---

# 15. Storage

Futura categoria:

```text
Storage:
❯ S3
  MinIO
  Local filesystem
  None
```

Se S3:

```env
S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
```

Se Docker estiver habilitado e MinIO for escolhido, o serviço `minio` será incluído no Compose.

---

# 16. Logging

Opções:

```text
Pino
Winston
Nest Logger
```

Recomendação padrão:

```text
Pino
```

O Nyctibius deverá configurar:

- logger;
- formato adequado para desenvolvimento;
- JSON em ambientes apropriados;
- integração com NestJS.

---

# 17. Health Check

Opções:

```text
@nestjs/terminus
None
```

Se selecionado:

```text
GET /health
```

Deverá verificar, conforme as tecnologias utilizadas:

```text
Application
Database
Redis
Message Broker
```

Exemplo:

```text
GET /health

{
  "status": "ok",
  "checks": {
    "database": "up",
    "redis": "up"
  }
}
```

Cada tecnologia contribui com o seu próprio health indicator (seção 29), de modo que o módulo de health nunca referencie algo que não foi selecionado.

---

# 18. Observability

Futuro.

Opções:

```text
Metrics:
  Prometheus
  None

Tracing:
  OpenTelemetry
  None

Error tracking:
  Sentry
  None
```

---

# 19. Docker

Opções:

```text
Docker:
❯ Dockerfile + Docker Compose
  Dockerfile only
  None
```

## Dockerfile

Gerar Dockerfile adequado para produção.

Considerar:

- multi-stage build;
- instalação apenas de dependências necessárias;
- usuário não-root;
- `.dockerignore`;
- build otimizado.

## Docker Compose

O Compose deverá ser gerado dinamicamente.

Exemplo:

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"

  postgres:
    image: postgres:17

  redis:
    image: redis:7

  rabbitmq:
    image: rabbitmq:4-management
```

Regras:

- os serviços devem existir somente quando forem necessários;
- as imagens devem ter **versão major fixada** (nunca `latest`), definida no Docker Service Registry;
- serviços com estado devem declarar volumes nomeados;
- serviços devem declarar healthcheck sempre que a imagem permitir.

---

# 20. Environment

Gerar:

```text
.env
.env.example
```

Regras:

- `.env.example` nunca contém secrets, apenas chaves e valores de exemplo não sensíveis;
- `.env` (não versionado) recebe valores funcionais para desenvolvimento local, incluindo segredos **gerados aleatoriamente no momento da criação** do projeto.

Exemplo de `.env.example`:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=

REDIS_URL=

RABBITMQ_URL=

JWT_SECRET=
```

O conteúdo deverá ser gerado de acordo com as tecnologias selecionadas.

---

# 21. Git

Opções:

```text
Initialize Git
Don't initialize
```

Se selecionado:

```bash
git init
```

Gerar:

```text
.gitignore
```

Opcionalmente:

```text
.gitattributes
```

O commit inicial só deve ser feito depois da geração, da instalação de dependências, de comandos pós-geração (como `prisma generate`) e da formatação, para que o repositório nasça limpo.

---

# 22. Code Quality

Opções:

```text
ESLint
Prettier
Husky
lint-staged
Commitlint
```

O projeto deverá sair pronto para:

```bash
npm run lint
npm run format
npm run test
```

---

# 23. Testing

Opções:

```text
Jest
Vitest
None
```

Observação: Vitest com NestJS exige SWC (ou equivalente) para suportar decorators com metadata. Por isso fica para a v0.3.

Futuramente:

```text
E2E
Integration tests
Testcontainers
```

---

# 24. CI/CD

Futuro.

Opções:

```text
GitHub Actions
GitLab CI
None
```

Exemplo:

```text
.github/
└── workflows/
    ├── ci.yml
    └── docker.yml
```

Pipeline inicial:

```text
Install
   ↓
Lint
   ↓
Typecheck
   ↓
Unit Tests
   ↓
Build
```

---

# 25. Presets

O Nyctibius deverá possuir presets para acelerar projetos comuns.

**Semântica:** um preset define **valores iniciais editáveis**, não valores forçados. No modo interativo, o wizard é pré-preenchido com o preset e o usuário pode alterar qualquer escolha. No modo não interativo, flags explícitas sobrescrevem o preset.

## Minimal

```text
NestJS
TypeScript
Config
ESLint
Prettier
Jest
```

## REST API

```text
Minimal
Swagger
Validation
```

## REST API + PostgreSQL

```text
REST API
PostgreSQL
Prisma
Docker
```

## Production API

```text
REST API
PostgreSQL
Prisma
Redis
JWT
Swagger
Validation
Pino
Health Check
Docker
Testing
```

## Microservice

```text
NestJS
Message Broker
Validation
Config
Logging
Health Check
Docker
```

---

# 26. CLI

Comando principal:

```bash
npx nyctibius
```

Criar projeto diretamente:

```bash
npx nyctibius my-api
```

Modo não interativo:

```bash
npx nyctibius my-api --preset production
```

Exemplo declarativo:

```bash
npx nyctibius my-api \
  --database postgres \
  --orm prisma \
  --swagger \
  --auth jwt \
  --redis \
  --rabbitmq \
  --docker
```

Informações:

```bash
nyctibius --version
nyctibius --help
```

## 26.1 Comportamentos obrigatórios

- Wizard e flags devem produzir o **mesmo** objeto `ProjectOptions` e passar pela **mesma** validação. Não podem existir dois caminhos de geração divergentes.
- Se o diretório de destino já existir e não estiver vazio, a CLI deve recusar ou pedir confirmação explícita.
- `--dry-run`: lista os arquivos, dependências e serviços que seriam gerados, sem escrever nada em disco.
- `--no-install`: gera o projeto sem instalar dependências.
- `--yes`: aceita os valores padrão sem perguntas.
- Se a instalação de dependências falhar, o projeto gerado é mantido e a CLI exibe uma mensagem clara com o comando para tentar novamente. Nunca apagar o projeto.
- Códigos de saída diferentes de zero em qualquer falha, para uso em CI.

---

# 27. Arquitetura interna

Estrutura inicial:

```text
nyctibius/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   └── options/
│   │
│   ├── prompts/
│   │   ├── project.prompt.ts
│   │   ├── database.prompt.ts
│   │   ├── api.prompt.ts
│   │   ├── auth.prompt.ts
│   │   ├── infrastructure.prompt.ts
│   │   ├── docker.prompt.ts
│   │   └── tooling.prompt.ts
│   │
│   ├── generators/
│   │   ├── base/
│   │   ├── database/
│   │   ├── auth/
│   │   ├── cache/
│   │   ├── messaging/
│   │   ├── jobs/
│   │   ├── docker/
│   │   └── tooling/
│   │
│   ├── assembler/
│   │
│   ├── registry/
│   │   ├── docker-services.ts
│   │   └── dependencies.ts
│   │
│   ├── templates/
│   │   ├── base/
│   │   ├── prisma/
│   │   ├── typeorm/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── kafka/
│   │   ├── swagger/
│   │   └── docker/
│   │
│   ├── config/
│   ├── validation/
│   └── types/
│
├── tests/
├── package.json
└── tsconfig.json
```

## 27.1 Stack sugerida para a própria CLI

| Responsabilidade | Sugestão |
|---|---|
| Parsing de argumentos | `commander` ou `citty` |
| Wizard interativo | `@clack/prompts` |
| Execução do gerenciador de pacotes | `execa` |
| Templates | Handlebars |
| Validação de `ProjectOptions` | `zod` |
| Alterações pontuais em código TypeScript (opcional) | `ts-morph` |

---

# 28. Modelo de configuração

Todas as respostas do wizard (ou flags) deverão convergir para um objeto único:

```ts
interface ProjectOptions {
  projectName: string;
  scope?: string;
  preset?: 'minimal' | 'rest' | 'rest-postgres' | 'production' | 'microservice';

  packageManager: 'npm' | 'pnpm' | 'yarn';

  nodeVersion: string;

  api: {
    adapter: 'express' | 'fastify';
    swagger: boolean;
    validation: 'class-validator' | 'zod' | 'none';
  };

  database: {
    provider: 'postgres' | 'mysql' | 'mongodb' | 'none';
    orm: 'prisma' | 'typeorm' | 'mongoose' | 'none';
  };

  auth: {
    provider: 'jwt' | 'none';
    refreshToken: boolean;
  };

  cache: {
    provider: 'redis' | 'none';
  };

  messaging: {
    provider: 'rabbitmq' | 'kafka' | 'none';
  };

  jobs: {
    provider: 'bullmq' | 'none';
  };

  storage?: {
    provider: 's3' | 'minio' | 'local' | 'none';
  };

  logging: {
    provider: 'pino' | 'winston' | 'nest';
  };

  health: boolean;

  observability?: {
    metrics: 'prometheus' | 'none';
    tracing: 'opentelemetry' | 'none';
    errorTracking: 'sentry' | 'none';
  };

  docker: {
    enabled: boolean;
    compose: boolean;
  };

  git: {
    initialize: boolean;
  };

  quality: {
    eslint: boolean;
    prettier: boolean;
    husky: boolean;
    lintStaged?: boolean;
    commitlint?: boolean;
  };

  testing: {
    framework: 'jest' | 'vitest' | 'none';
    e2e?: boolean;
  };

  ci?: {
    provider: 'github-actions' | 'gitlab-ci' | 'none';
  };
}
```

Campos marcados como opcionais pertencem a versões futuras e existem desde já para não quebrar o contrato quando forem implementados.

---

# 29. Sistema de generators

Cada recurso deverá ser independente.

Um generator **não escreve diretamente nos arquivos centrais** do projeto (`main.ts`, `app.module.ts`, `package.json`, `.env.example`, `docker-compose.yml`). Em vez disso, ele **retorna contribuições**, e uma etapa final (o assembler) monta os arquivos centrais a partir da soma de todas elas. Isso evita conflitos entre generators e a explosão combinatória de templates.

```ts
interface Contribution {
  dependencies?: Dependency[];
  devDependencies?: Dependency[];
  scripts?: Record<string, string>;
  env?: EnvVar[];
  envValidation?: EnvSchemaEntry[];
  dockerServices?: DockerService[];
  moduleImports?: ModuleImport[];     // vai para app.module.ts
  bootstrapHooks?: BootstrapHook[];   // vai para main.ts
  healthIndicators?: HealthIndicator[];
  files?: TemplateFile[];
  postGeneration?: PostGenerationStep[];
}

interface Generator {
  id: string;

  shouldRun(options: ProjectOptions): boolean;

  contribute(
    context: GeneratorContext,
  ): Promise<Contribution>;
}
```

Exemplos:

```text
PrismaGenerator
RedisGenerator
RabbitMQGenerator
SwaggerGenerator
DockerGenerator
JwtGenerator
HealthGenerator
```

O assembler é responsável por:

1. mesclar dependências e scripts no `package.json`, sem duplicar;
2. compor `app.module.ts` e `main.ts` a partir de `moduleImports` e `bootstrapHooks`, respeitando a ordem declarada;
3. compor `.env`, `.env.example` e o schema de validação de ambiente;
4. montar o `docker-compose.yml` a partir de `dockerServices`;
5. escrever os arquivos de template restantes.

Isso permite adicionar novas tecnologias sem modificar todo o CLI.

---

# 30. Dependency Resolution

O Nyctibius deverá possuir um pequeno sistema de resolução de dependências com três tipos de relação:

| Relação | Comportamento | Exemplo |
|---|---|---|
| `implies` | Habilita automaticamente e informa o usuário | BullMQ implica Redis |
| `requires` | Exige uma condição; se não atendida, o wizard pergunta ou bloqueia | TypeORM requer provider relacional |
| `conflicts` | Impede a combinação | TypeORM e MongoDB (enquanto não houver suporte) |

Exemplo de grafo:

```text
BullMQ
  └── implies Redis

JWT
  └── implies Passport

Swagger
  └── implies Nest Swagger

Prisma
  └── implies Prisma Client
```

O sistema deverá:

1. detectar dependências indiretas;
2. evitar instalações duplicadas;
3. validar conflitos;
4. informar decisões automáticas ao usuário.

Exemplo:

```text
[info] BullMQ requires Redis.
[ok] Redis has been enabled.
```

---

# 31. Docker Service Registry

Os serviços Docker também devem ser tratados como módulos.

Exemplo:

```ts
interface DockerService {
  name: string;
  image: string;            // sempre com versão fixada
  ports: Port[];
  environment: EnvironmentVariable[];
  volumes?: Volume[];
  healthcheck?: Healthcheck;
  dependsOn?: string[];
}
```

Assim:

```text
PostgreSQL
Redis
RabbitMQ
Kafka (KRaft)
MongoDB
MinIO
```

podem ser registrados independentemente.

O `docker-compose.yml` será montado a partir dos serviços selecionados.

---

# 32. Template Engine

Inicialmente, utilizar templates simples.

Exemplo:

```text
templates/
└── redis/
    ├── redis.module.ts.hbs
    └── redis.service.ts.hbs
```

Com geração condicional:

```text
{{#if redis}}
REDIS_URL={{redisUrl}}
{{/if}}
```

A implementação poderá usar Handlebars ou outro template engine.

Templates devem conter apenas o que é específico da tecnologia. Arquivos centrais (`main.ts`, `app.module.ts`) são montados pelo assembler, e não por templates monolíticos por combinação.

---

# 33. Fluxo de geração

```text
CLI (wizard ou flags)
 │
 ▼
ProjectOptions
 │
 ▼
Validation
 │
 ▼
Dependency Resolution
 │
 ▼
Generator Registry
 │
 ├── Base
 ├── Database
 ├── Auth
 ├── Cache
 ├── Messaging
 ├── Jobs
 ├── Docker
 ├── Testing
 └── Tooling
 │
 ▼
Contributions
 │
 ▼
Assembler
 │
 ▼
File Generation
 │
 ▼
Dependency Installation
 │
 ▼
Post Generation (prisma generate, format, etc.)
 │
 ▼
Git Init + commit inicial
 │
 ▼
Success
```

---

# 34. Pós-geração

Ao terminar:

```text
[ok] Project created
[ok] Dependencies installed
[ok] Configuration generated
[ok] Docker Compose generated
[ok] Environment template generated
[ok] Git repository initialized

Next steps:

  cd soundflow-api

  docker compose up -d

  npm run start:dev
```

Também poderá informar:

```text
Services:

  API       http://localhost:3000
  Swagger   http://localhost:3000/docs
  RabbitMQ  http://localhost:15672
```

---

# 35. Segurança

O Nyctibius nunca deverá:

- armazenar secrets reais em arquivos versionados;
- inserir tokens em `.env.example`;
- versionar `.env`;
- imprimir secrets no terminal;
- colocar credenciais diretamente em templates.

O arquivo `.env` local pode conter segredos de desenvolvimento **gerados aleatoriamente no momento da criação**, para que o projeto execute sem configuração manual.

Gerar:

```gitignore
.env
.env.*
!.env.example
```

---

# 36. Marcos de entrega

## Marco 0: prova de arquitetura

Objetivo: validar o sistema de generators, contribuições e assembler de ponta a ponta antes de ampliar o escopo.

- [x] CLI mínima (nome do projeto, gerenciador de pacotes)
- [x] `ProjectOptions`, `Generator`, `Contribution` e assembler
- [x] Base NestJS própria (Express)
- [x] Config com validação de ambiente
- [x] Swagger
- [x] PostgreSQL + Prisma
- [x] Dockerfile + Docker Compose (PostgreSQL)
- [x] `.env`, `.env.example`, `.gitignore`
- [x] Teste que gera o projeto, instala e executa o build

## MVP v0.1

### Core

- [x] CLI
- [x] Nome do projeto
- [x] npm/pnpm/yarn
- [x] geração de projeto NestJS
- [x] instalação de dependências
- [x] `.env`
- [x] `.env.example`
- [x] `.gitignore`
- [x] `--dry-run`

### API

- [x] Express
- [ ] Fastify
- [x] Swagger
- [ ] Validation (class-validator)

### Database

- [x] PostgreSQL
- [x] Prisma
- [ ] TypeORM

### Infrastructure

- [x] Redis
- [x] RabbitMQ
- [x] BullMQ
- [x] Kafka (KRaft)
- [x] JWT

### Tooling

- [ ] ESLint
- [ ] Prettier
- [ ] Jest

### Docker

- [x] Dockerfile
- [x] Docker Compose
- [x] PostgreSQL
- [x] Redis
- [x] RabbitMQ
- [x] Kafka

---

# 37. v0.2

- [ ] MySQL
- [ ] MongoDB
- [ ] Mongoose
- [ ] Kafka (KRaft)
- [ ] JWT
- [ ] Zod (após decisão de biblioteca)
- [ ] Pino
- [ ] Health checks
- [ ] Git initialization
- [ ] Presets
- [ ] CLI flags completas

---

# 38. v0.3

- [ ] S3
- [ ] MinIO
- [ ] Prometheus
- [ ] OpenTelemetry
- [ ] Sentry
- [ ] Vitest
- [ ] Husky
- [ ] lint-staged
- [ ] Commitlint
- [ ] GitHub Actions
- [ ] GitLab CI

---

# 39. Futuro

Possíveis funcionalidades:

```text
Nyctibius Add
Nyctibius Generate
Nyctibius Doctor
Nyctibius Upgrade
```

Por exemplo:

```bash
nyctibius add redis
```

ou:

```bash
nyctibius add rabbitmq
```

Isso transformaria o Nyctibius de um simples initializer em uma ferramenta de scaffolding para o ciclo de vida inicial da aplicação.

---

# 40. Critérios de qualidade

Um projeto gerado pelo Nyctibius deverá:

- compilar imediatamente;
- executar sem configuração manual desnecessária;
- possuir `.env.example`;
- possuir README atualizado;
- possuir scripts npm funcionais;
- possuir Docker funcional quando selecionado;
- possuir serviços Docker apenas quando necessários;
- possuir dependências compatíveis;
- não possuir código morto relacionado a opções não selecionadas;
- não conter secrets versionados;
- falhar na inicialização, com mensagem clara, se variáveis de ambiente obrigatórias estiverem ausentes;
- possuir testes básicos para os generators.

---

# 41. Testes

O próprio Nyctibius deverá ser testado gerando projetos reais.

## 41.1 Estratégia em camadas

Testar todas as combinações com instalação e build completos é inviável. A estratégia é:

1. **Testes unitários** de cada generator (a contribuição retornada para um conjunto de opções).
2. **Testes de snapshot** dos arquivos gerados, rápidos e executados a cada alteração.
3. **Testes de resolução de dependências** (`implies`, `requires`, `conflicts`).
4. **Matriz reduzida com build completo no CI**, baseada em *pairwise testing* (cobertura de todos os pares de opções), mais os presets oficiais.
5. **Job agendado** que atualiza as versões fixadas e roda a matriz, detectando quebras causadas por novas versões de dependências.

## 41.2 Exemplo de estrutura

```text
tests/
├── minimal.test.ts
├── postgres-prisma.test.ts
├── postgres-typeorm.test.ts
├── redis.test.ts
├── rabbitmq.test.ts
├── kafka.test.ts
├── docker.test.ts
├── dependency-resolution.test.ts
└── production-preset.test.ts
```

## 41.3 O que cada teste de geração deve fazer

1. executar o Nyctibius (modo não interativo);
2. gerar um projeto temporário;
3. verificar arquivos;
4. verificar `package.json`;
5. verificar `.env.example`;
6. verificar Docker Compose;
7. executar `npm install`;
8. executar `npm run build`.

Os passos 7 e 8 rodam apenas na matriz reduzida do CI.

---

# 42. Definição de pronto

Uma feature do Nyctibius só estará pronta quando:

```text
[ ] Prompt implementado
[ ] Flags de CLI equivalentes implementadas
[ ] Opções validadas
[ ] Relações de dependência definidas (implies, requires, conflicts)
[ ] Dependências definidas
[ ] Templates criados
[ ] Contribuição do generator implementada
[ ] Configuração gerada
[ ] Docker atualizado
[ ] .env e .env.example atualizados
[ ] Validação de ambiente atualizada
[ ] README gerado atualizado
[ ] Testes implementados
[ ] Projeto gerado compila
[ ] Projeto gerado executa
```

---

# 43. Filosofia

O Nyctibius deve seguir uma ideia simples:

> **Escolha a arquitetura. O Nyctibius cuida do boilerplate.**

O desenvolvedor não deveria gastar os primeiros 30 a 60 minutos de um projeto instalando e configurando as mesmas ferramentas.

O objetivo é que:

```bash
npx nyctibius
```

seja suficiente para sair de:

```text
"Quero criar uma API NestJS"
```

para:

```text
"Minha aplicação já está pronta para começar o desenvolvimento."
```

---

# 44. Nome

**Nyctibius**

O nome faz referência ao gênero **Nyctibius**, conhecido como poto/urutaú.

CLI:

```bash
nyctibius
```

NPM:

```text
nyctibius
```

Comando principal:

```bash
npx nyctibius
```

Tagline sugerida:

> **Nyctibius: Bootstrap your NestJS architecture.**