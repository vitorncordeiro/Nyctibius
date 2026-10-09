# Correção dos avisos de deprecated e vulnerabilidades no template

Guia para atualizar o template do gerador de boilerplate e eliminar (ou reduzir bastante) os avisos `npm warn deprecated` e as vulnerabilidades reportadas pelo `npm audit` ao criar um projeto novo.

## 1. Diagnóstico

Os avisos têm uma origem principal: o `eslint@8.57.1` declarado no `package.json` gerado. Ele puxa em cascata:

| Pacote deprecated | Quem puxa |
| --- | --- |
| `@humanwhocodes/config-array@0.13.0` | `eslint@8` |
| `@humanwhocodes/object-schema@2.0.3` | `eslint@8` |
| `rimraf@3.0.2` | `eslint@8` (via `file-entry-cache` e `flat-cache`) |
| `glob@7.2.3` | `rimraf@3` e outras ferramentas antigas |
| `inflight@1.0.6` | `glob@7` |
| `eslint@8.57.1` | declarado direto no template |

As 45 vulnerabilidades (6 moderate, 39 high) costumam vir de ferramentas de desenvolvimento (build, lint, testes). Confirme isso na etapa 2.

## 2. Confirmar a causa no projeto gerado

Antes de alterar qualquer coisa, rode dentro de um projeto gerado:

```bash
npm ls glob inflight rimraf
npm audit --omit=dev
npm audit
```

- `npm ls ...` mostra a árvore de dependências que leva a cada pacote antigo.
- `npm audit --omit=dev` mostra só o que afeta produção.
- `npm audit` mostra o total, para comparar com o resultado final.

Anote os números atuais para comparar depois.

## 3. Atualizar o ESLint para a versão 9

### 3.1 Requisito de Node

O ESLint 9 exige Node `^18.18.0`, `^20.9.0` ou `>=21.1.0`. Se o gerador declara `engines` ou documenta a versão de Node, atualize.

### 3.2 Alterar o `package.json` do template

Troque o ESLint e os pacotes relacionados:

```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "globals": "^15.0.0"
  }
}
```

Se o template usa TypeScript, remova os pacotes antigos e use o pacote unificado:

```diff
- "@typescript-eslint/parser": "^6.0.0",
- "@typescript-eslint/eslint-plugin": "^6.0.0",
+ "typescript-eslint": "^8.0.0",
```

Se o template usa React, atualize também:

```json
{
  "devDependencies": {
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0"
  }
}
```

Confira sempre a última versão estável de cada pacote no momento da implementação (`npm view <pacote> version`) e ajuste os números acima se necessário.

### 3.3 Trocar o arquivo de configuração

O ESLint 9 usa o formato flat config. Remova do template o arquivo antigo:

```
.eslintrc.cjs
.eslintrc.json
.eslintrc.js
.eslintignore
```

E adicione `eslint.config.js`. Exemplo para um template React com TypeScript:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

Para um template sem TypeScript, use apenas `js.configs.recommended` e ajuste `files` para `**/*.{js,jsx}`.

Observações:

- O campo `ignores` substitui o antigo `.eslintignore`.
- O `package.json` precisa ter `"type": "module"` para usar `import` no `eslint.config.js`. Se o template for CommonJS, nomeie o arquivo `eslint.config.mjs`.

### 3.4 Ajustar o script de lint

Remova a flag `--ext` e a flag `--report-unused-disable-directives`, que mudaram no ESLint 9:

```diff
- "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
+ "lint": "eslint . --max-warnings 0",
```

## 4. Revisar as demais dependências do template

Depois do ESLint, sobram normalmente as ferramentas de build e teste. Para cada uma, verifique se a versão fixada no template é a atual:

```bash
npm outdated
```

Pontos comuns de atenção:

- Vite, Webpack ou outro bundler
- Jest, Vitest ou outro framework de testes
- Prettier e plugins
- Plugins de framework (por exemplo `@vitejs/plugin-react`)

Atualize uma ferramenta por vez e teste (build, lint, test) a cada mudança. Isso facilita achar quem quebrou algo.

## 5. Plano B: `overrides` para transitivas

Se, depois dos passos acima, ainda restar uma dependência transitiva antiga que você não controla, force a versão no `package.json` do template:

```json
{
  "overrides": {
    "glob": "^10.0.0",
    "rimraf": "^5.0.0"
  }
}
```

Cuidados:

- Forçar uma major diferente pode quebrar o pacote que dependia da antiga. Teste build, lint e testes depois.
- Trate o `overrides` como solução temporária e remova quando a dependência de origem for atualizada.
- Não use `npm audit fix --force` dentro do template. Ele altera versões sem controle e pode gerar um estado difícil de reproduzir.

## 6. Validação

1. Gere um projeto novo do zero com o gerador.
2. Rode `npm install` e confira o log. Os avisos de `eslint`, `glob`, `rimraf`, `inflight` e `@humanwhocodes/*` devem ter desaparecido.
3. Rode as verificações do projeto:

```bash
npm run lint
npm run build
npm run dev
```

4. Compare o `npm audit` com os números anotados na etapa 2. A meta é cair bastante em relação às 45 vulnerabilidades iniciais.
5. Rode `npm audit --omit=dev` e confirme que não há vulnerabilidades em dependências de produção.

## 7. Checklist final

- [ ] Medi os números iniciais (`npm ls`, `npm audit`)
- [ ] Atualizei o `eslint` para a versão 9
- [ ] Substituí `.eslintrc.*` e `.eslintignore` por `eslint.config.js`
- [ ] Atualizei plugins e parser para versões compatíveis com o ESLint 9
- [ ] Ajustei o script de lint (sem `--ext`)
- [ ] Revisei as demais dependências com `npm outdated`
- [ ] Usei `overrides` apenas se realmente necessário
- [ ] Gerei um projeto novo e validei lint, build e dev
- [ ] Comparei o resultado final do `npm audit` com o inicial
- [ ] Atualizei a documentação do gerador com a versão mínima de Node

## 8. Manutenção contínua

Os avisos voltam com o tempo, porque as dependências envelhecem. Para evitar isso:

- Revise as versões do template a cada poucos meses.
- Configure o Dependabot ou o Renovate no repositório do gerador para abrir PRs de atualização automaticamente.
- Adicione um teste no CI do gerador que cria um projeto, roda `npm install` e falha se aparecerem avisos `deprecated` ou vulnerabilidades `high`.