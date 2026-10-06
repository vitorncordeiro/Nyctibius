# Nyctibius

Nyctibius é um gerador de projetos NestJS pensado para acelerar a criação da base de uma API backend com arquitetura consistente e configuração mínima manual.

Ele foi inspirado no conceito de scaffolding opinado, em que a CLI decide padrões úteis e gera uma estrutura pronta para desenvolvimento, sem abandonar a possibilidade de customização posterior.

## Visão geral

O objetivo do projeto é reduzir o tempo gasto em boilerplate inicial de aplicações NestJS:

- criar a base do projeto sem depender de `nest new`;
- gerar arquivos centrais de forma determinística;
- integrar tecnologias comuns como Prisma, Swagger, Docker e autenticação JWT;
- permitir execução interativa e modo não interativo em CI/CD;
- manter a arquitetura dos generators e do assembler como base extensível.

## Status atual

Este repositório está em fase inicial de implementação, com a base da CLI já funcionando e a arquitetura de geração estruturada conforme a proposta em `PROJECT.md`.

A implementação atual cobre:

- geração de um projeto NestJS base;
- validação de opções com Zod;
- geração condicional de Swagger e Prisma;
- suporte a Dockerfile e docker-compose;
- geração de `.env`, `.env.example` e `.gitignore`;
- modo `--dry-run`;
- geração de projeto em diretório novo com `--no-install`.

## Como usar

### Instalar dependências

```bash
npm install
```

### Compilar o CLI

```bash
npm run build
```

### Executar em modo simulado

```bash
node dist/index.js --dry-run demo-api --package-manager npm
```

### Gerar um projeto real

```bash
node dist/index.js demo-api --package-manager npm --no-install
```

### Ajuda da CLI

```bash
node dist/index.js --help
```

## Opções principais

```bash
node dist/index.js <nome-do-projeto> \
  --package-manager npm \
  --database postgres \
  --orm prisma \
  --swagger \
  --auth jwt \
  --redis \
  --docker
```

Principais recursos suportados:

- `--dry-run`
- `--no-install`
- `--database <postgres|mysql|mongodb|none>`
- `--orm <prisma|typeorm|mongoose|none>`
- `--swagger`
- `--auth <jwt|none>`
- `--redis`
- `--docker`
- `--package-manager <npm|pnpm|yarn>`

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

## Fluxo de geração

A arquitetura segue a proposta de `PROJECT.md`:

1. CLI coleta opções;
2. validação com Zod;
3. resolução de dependências automáticas;
4. execução dos generators;
5. agregação de contribuições por `assembler`;
6. escrita dos arquivos finais;
7. instalação de dependências e pós-processamento.

## Objetivo do projeto

O Nyctibius busca responder a uma necessidade simples:

> escolher a arquitetura e deixar o boilerplate pesado para a ferramenta.

Em outras palavras, o desenvolvedor define a base tecnológica e a CLI gera o projeto já com a infraestrutura básica pronta para começar a desenvolver.

## Próximos passos

A evolução planejada segue os marcos descritos em `PROJECT.md`, incluindo:

- suporte completo a presets;
- autenticação JWT completa;
- Redis, RabbitMQ e BullMQ;
- PostgreSQL/MySQL/MongoDB com regras de dependência;
- health checks, logging e Docker Compose mais completo;
- testes de geração com build real de projetos gerados.

## Contribuição

Contribuições são bem-vindas. Para colaborar:

```bash
git checkout -b feature/sua-mudanca
npm install
npm run build
npm test
```
