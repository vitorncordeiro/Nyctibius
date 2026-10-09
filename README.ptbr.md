# Nyctibius

<p align="center">
  <img src="./nyctibius.svg" alt="Nyctibius logo" width="180" />
</p>

<div align="center">
  <p>
    <a href="./README.md">EN</a> |
    <a href="./README.ptbr.md">PT-BR</a>
  </p>
  <p>
    <a href="https://www.npmjs.com/package/nyctibius"><img src="https://img.shields.io/npm/v/nyctibius.svg" alt="npm version" /></a>
  </p>
</div>

Nyctibius é um gerador de projetos NestJS pensado para acelerar a criação da base de uma API backend com arquitetura consistente e configuração mínima manual.

Ele foi inspirado no conceito de scaffolding opinado, em que a CLI aplica defaults úteis e gera uma estrutura pronta para desenvolvimento, sem impedir customização posterior.

## Visão geral

O objetivo do projeto é reduzir o tempo gasto em boilerplate inicial de aplicações NestJS:

- criar a base do projeto sem depender de `nest new`;
- gerar arquivos centrais de forma determinística;
- integrar tecnologias comuns como Prisma, Swagger, Docker, Redis, BullMQ, RabbitMQ, Kafka e JWT;
- permitir execução interativa e modo não interativo em CI/CD;
- manter a arquitetura de generators e assembler extensível.

## Status atual

A base do CLI está funcional e a implementação atual cobre:

- geração de um projeto NestJS base;
- validação de opções com Zod;
- resolução automática de dependências (`implies`, `requires`, `conflicts`);
- suporte condicional a Swagger e Prisma;
- suporte a Redis, BullMQ, RabbitMQ, Kafka e JWT;
- geração de Dockerfile e serviços do Compose;
- geração de `.env`, `.env.example`, `.gitignore` e estrutura inicial de módulos;
- modo `--dry-run`;
- geração de projeto em diretório novo com `--no-install`.

## Como usar

Você pode executar o Nyctibius diretamente via `npx` através do [pacote npm](https://www.npmjs.com/package/nyctibius), ou clonar o repositório localmente e rodar a partir do código-fonte.

### Opção 1: Via `npx` (Sem necessidade de clone ou setup prévio)

Como o projeto conta com pacote publicado no npm ([nyctibius](https://www.npmjs.com/package/nyctibius)), você pode executá-lo diretamente:

```bash
# Modo interativo (wizard)
npx nyctibius

# Ou passando as opções diretamente
npx nyctibius demo-api --database postgres --orm prisma --docker
```

Também é possível instalar globalmente na máquina:

```bash
npm install -g nyctibius
nyctibius --interactive
```

### Opção 2: A partir do repositório clonado

Se preferir clonar o repositório para testar ou contribuir:

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/vitorncordeiro/nyctibius.git
cd nyctibius
npm install
```

2. Compile a CLI:

```bash
npm run build
```

3. Execute a CLI:

#### Executar em modo interativo

Quando a CLI é executada em um terminal interativo sem opções explícitas, ela abre um wizard de seleção com navegação por setas. Também é possível forçar esse comportamento com:

```bash
node dist/index.js --interactive
```

#### Executar em modo simulado

```bash
node dist/index.js --dry-run demo-api --package-manager npm
# ou via npx:
# npx nyctibius --dry-run demo-api --package-manager npm
```

#### Gerar um projeto real

```bash
node dist/index.js demo-api --package-manager npm --no-install
# ou via npx:
# npx nyctibius demo-api --package-manager npm --no-install
```

#### Ajuda da CLI

```bash
node dist/index.js --help
# ou via npx:
# npx nyctibius --help
```

## Opções principais

```bash
# Via npx:
npx nyctibius <nome-do-projeto> \
  --package-manager npm \
  --database postgres \
  --orm prisma \
  --swagger \
  --auth jwt \
  --cache redis \
  --jobs bullmq \
  --messaging rabbitmq \
  --docker

# Ou a partir do build local:
node dist/index.js <nome-do-projeto> \
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

Principais recursos suportados:

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

## Regras de dependência implementadas

A CLI agora faz ajustes automáticos para manter o projeto consistente:

- `BullMQ` ativa `Redis` automaticamente;
- `MongoDB + TypeORM` é corrigido para `Mongoose`;
- `database === none` zera `orm`;
- combinações inválidas são rejeitadas por validação.

## Estrutura do projeto

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

## Fluxo de geração

A arquitetura segue a proposta de `PROJECT.md`:

1. CLI coleta opções;
2. validação com Zod;
3. resolução automática de dependências;
4. execução dos generators;
5. agregação de contribuições pelo `assembler`;
6. escrita dos arquivos finais;
7. instalação de dependências e pós-processamento.

## Objetivo do projeto

O Nyctibius busca responder a uma necessidade simples:

> escolher a arquitetura e deixar o boilerplate pesado para a ferramenta.

Em outras palavras, o desenvolvedor define a base tecnológica e a CLI gera um projeto com a infraestrutura básica pronta para começar a desenvolver.

## Próximos passos

A evolução planejada continua seguindo os marcos descritos em `PROJECT.md`, com foco em:

- presets mais completos;
- refinamento da autenticação JWT e refresh tokens;
- health checks e observabilidade;
- ampliar a cobertura de Docker Compose e serviços locais;
- testes de smoke em projetos gerados e validações mais profundas.

## Contribuição

Contribuições são bem-vindas. Para colaborar:

```bash
git checkout -b feature/sua-mudanca
npm install
npm run build
npm test
```
