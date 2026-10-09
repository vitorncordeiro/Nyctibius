# Roadmap do Nyctibius

## Objetivo

O Nyctibius é um gerador de projetos NestJS com foco em velocidade, consistência e configuração inicial funcional. O objetivo do roadmap é orientar a evolução do projeto mantendo o que já foi implementado e alinhando o futuro com a arquitetura real do repositório.

Este documento não pretende substituir a visão do produto descrita em README.md e PROJECT.md; ele consolida o estado atual, organiza prioridades e indica as próximas melhorias com base no MVP já validado.

---

## 1. Estado atual do projeto

O estado atual do repositório já contempla um MVP funcional do gerador:

- [x] CLI funcional para geração de projetos
- [x] suporte a `--interactive`, `--dry-run` e `--no-install`
- [x] opções declarativas via flags e prompts
- [x] validação de configuração com Zod
- [x] geração determinística da base NestJS
- [x] resolução automática de dependências (`implies`, `requires`, `conflicts`)
- [x] suporte a Swagger, Prisma, Redis, BullMQ, RabbitMQ, Kafka e JWT
- [x] geração de Dockerfile e Docker Compose
- [x] geração de `.env`, `.env.example`, `.gitignore` e estrutura inicial do projeto
- [x] arquitetura modular por geradores
- [x] montagem do projeto via assembler
- [x] testes focados em geração e validação de opções

Esses itens mostram que o projeto já saiu do estágio de "esqueleto" e entrou em uma etapa de geração funcional, com decisões de arquitetura e regras de compatibilidade codificadas.

---

## 2. Estrutura atual do projeto

A estrutura atual do repositório já reflete a arquitetura do gerador:

```text
nyctibius/
├── src/
│   ├── assembler.ts
│   ├── index.ts
│   ├── project-options.ts
│   ├── prompts.ts
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
├── ROADMAP.md
├── dist/
└── nyctibius.svg
```

Essa estrutura é relevante para o roadmap porque revela a direção correta da evolução: em vez de criar uma aplicação monolítica, o projeto continua sendo um gerador modular, extensível e baseado em contribuições por recurso.

---

## 3. Regra fundamental

O roadmap mantém um princípio do original:

> Presets são conveniência, e não substituem a configuração manual.

Ou seja:

- o usuário pode escolher um preset;
- revisar as opções geradas;
- ajustar qualquer escolha antes da geração;
- continuar usando o fluxo manual quando preferir.

O wizard deve continuar permitindo excelência em UX sem bloquear a liberdade do usuário.

---

## 4. Visão da evolução

O projeto está em uma fase em que a base do gerador já existe. O próximo passo não é "instalar tudo"; o foco deve ser transformar a CLI em um gerador mais coerente, com opções mais ricas, melhor integração de ambientes e maior maturidade de projetos gerados.

A evolução deve seguir estes pilares:

1. estabilidade da base gerada;
2. convenções consistentes por feature;
3. validação mais forte de combinações;
4. melhores presets e experiências de uso;
5. geração de infraestrutura e qualidade de projeto.

---

## 5. Roadmap de implementação

### Fase 1 — Consolidar e estabilizar o MVP

Prioridade: P0

Objetivo: manter o gerador funcional, estável e previsível.

Checklist:

- [x] base do CLI
- [x] prompts e flags
- [x] resolução de dependências
- [x] validação de opções
- [x] montagem e escrita de arquivos
- [x] geração condicional de módulos
- [ ] padronizar versões de dependências e imagens Docker
- [ ] adicionar suíte de smoke tests mais ampla para projetos gerados
- [ ] validar casos extremos de combinações e geração em diferentes ambientes

Entregáveis esperados:

- CLI determinística;
- geração previsível em qualquer SO e shell;
- aumento da confiança em projetos gerados.

---

### Fase 2 — Configuração e ambiente

Prioridade: P0

Objetivo: evoluir a camada de configuração do projeto gerado e reduzir fricção no desenvolvimento.

Checklist:

- [ ] gerar `@nestjs/config` como base da aplicação gerada
- [ ] criar schema de configuração tipada por ambiente
- [ ] validar variáveis de ambiente de forma explícita
- [ ] gerar `.env` e `.env.example` de maneira consistente com módulos selecionados
- [ ] integrar configurações de database, cache, auth e message broker no `ConfigModule`
- [ ] padronizar arquivos como `configuration.ts`, `env.validation.ts` e módulos de ambiente

Itens de foco:

- configuração por ambiente;
- validação obrigatória de variáveis;
- geração de config centralizada sem acoplamento redundante.

---

### Fase 3 — Segurança, logging e observabilidade

Prioridade: P0

Objetivo: elevar a qualidade da base do projeto gerado para um cenário mais próximo do production-ready.

Checklist:

- [ ] Helmet
- [ ] CORS
- [ ] rate limiting
- [ ] logging estruturado com Pino
- [ ] request ID e correlation ID
- [ ] health checks com Terminus
- [ ] integração condicional de checks por tecnologia selecionada
- [ ] observabilidade básica em logs e endpoints de status

Tecnologias esperadas:

- `@nestjs/throttler`
- `@nestjs/terminus`
- `pino` ou wrapper de logger
- integrações de health checks para PostgreSQL, Redis e broker

---

### Fase 4 — Testes, qualidade e DX

Prioridade: P1

Objetivo: garantir que o projeto gerado tenha um nível mínimo de qualidade e uma experiência de desenvolvimento bem estruturada.

Checklist:

- [ ] Jest ou Vitest como padrão de testes
- [ ] testes unitários e e2e baseados em projetos gerados
- [ ] suporte a coverage e reports
- [ ] ESLint e Prettier configurados
- [ ] scripts de desenvolvimento e validação padronizados
- [ ] Husky e lint-staged como opções
- [ ] commit conventions com Commitlint (opcional)
- [ ] geração do setup de qualidade condicionada às escolhas do usuário

Meta:

- o projeto gerado não precisa ser "perfeito" de cara, mas precisa sair pronto para evoluir de forma segura.

---

### Fase 5 — Presets e customização

Prioridade: P1

Objetivo: tornar a experiência inicial mais rápida sem sacrificar o controle do usuário.

Checklist:

- [ ] definir presets reais para perfis comuns
- [ ] validar a aplicação de presets sem perder a configuração manual
- [ ] criar fluxo de revisão e personalização pós-preset
- [ ] permitir que o usuário altere qualquer opção após selecionar um preset
- [ ] manter todas as opções individuais disponíveis no wizard

Presets sugeridos:

- [ ] Minimal
- [ ] REST API
- [ ] Production API
- [ ] Microservices
- [ ] Full Backend

Regra:

> O preset deve ser um atalho de configuração, não um bloqueio para o fluxo manual.

---

### Fase 6 — Infraestrutura e Docker

Prioridade: P1

Objetivo: tornar a infraestrutura local do projeto gerado mais completa e mais útil em desenvolvimento.

Checklist:

- [ ] geração dinâmica de serviços Docker conforme escolhas do usuário
- [ ] PostgreSQL, MongoDB, Redis, Kafka e RabbitMQ em compose
- [ ] volumes e networks consistentes
- [ ] health checks de serviços dependentes
- [ ] suporte a `Dockerfile` multi-stage
- [ ] `.dockerignore` e organização da infraestrutura local

Escopo esperado:

- a geração de infraestrutura deve seguir a mesma lógica da geração de módulos: se a tecnologia foi escolhida, o serviço correspondente deve ser incluído automaticamente.

---

### Fase 7 — CI/CD e automação

Prioridade: P2

Objetivo: levar o gerador para um fluxo de entrega mais profissional.

Checklist:

- [ ] workflows de CI para lint, typecheck, test e build
- [ ] pipeline para Docker build
- [ ] suporte opcional a GitHub Actions
- [ ] estrutura de automação para validar projetos gerados em matrizes de combinações

Foco principal:

- garantir que o projeto gerado continue funcional após mudanças no gerador;
- reduzir regressões em novos módulos e combinações.

---

### Fase 8 — Expansão de integrações e arquitetura do projeto gerado

Prioridade: P2

Objetivo: aumentar a utilidade da CLI para cenários mais avançados sem perder a simplicidade.

Checklist:

- [ ] HTTP client com `@nestjs/axios`
- [ ] serialização e transformação de DTOs
- [ ] suporte a GraphQL
- [ ] suporte a WebSockets
- [ ] observabilidade com OpenTelemetry
- [ ] métricas para Prometheus
- [ ] integração de tracing e request correlation

Essas opções ficam em um nível posterior porque o valor mais imediato do projeto está na estrutura base, regras de compatibilidade e geração funcional.

---

## 6. Prioridades por impacto

### P0 — Essenciais para o MVP maduro

- validação e compatibilidade de opções
- geração determinística da estrutura base
- configuração de ambiente
- security básico
- logging e health checks

### P1 — Diferenciadores de produto

- presets
- qualidade do projeto gerado
- infraestrutura local
- expiração de workflows e DX

### P2 — Expansão de maturidade

- integração com HTTP client
- GraphQL/WebSocket
- OpenTelemetry
- CI/CD mais sofisticado

---

## 7. O que deve continuar sendo prioridade

Mesmo com o projeto já funcional, o foco central continua sendo:

- gerar um projeto NestJS coerente e executável;
- manter decisões arquiteturais consistentes;
- reduzir trabalho repetitivo sem trocar controle por convenção cega;
- permitir o uso em modo manual ou por preset;
- tornar o gerador extensível para nova tecnologia.

A evolução não deve transformar o Nyctibius em um framework, nem em um wrapper genérico sobre `nest new`. O valor real está em gerar projetos com regras claras, compatibilidade explícita e a base pronta para desenvolvimento.

---

## 8. Próximo conjunto de entregas recomendado

Para os próximos ciclos, a recomendação mais sensata é:

1. estabilizar a base do gerador com testes e versionamento
2. amadurecer configuração de ambiente e validação
3. evoluir security, logging e health checks
4. implementar presets reais e revisão pós-seleção
5. expandir Docker e CI/CD
6. abrir espaço para integrações futuras como HTTP client, GraphQL e observabilidade

Esse ordenamento preserva a evolução do roadmap original, mas ajusta a execução às capacidades e arquitetura que o projeto já possui hoje.
