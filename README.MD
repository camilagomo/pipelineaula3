# Pipeline Aula 3 — Playwright com Page Objects e CI/CD

Projeto de automação de testes E2E com Playwright utilizando o padrão Page Objects, integrado a duas ferramentas de CI/CD.

---

## Estrutura do Projeto

```
pipelineaula3/
├── pages/
│   └── classe.ts          # Page Object: LoginPage
├── tests/
│   └── classe.spec.ts     # Testes E2E usando o Page Object
├── .github/
│   └── workflows/
│       └── e2e.yml        # Exercício 2: GitHub Actions
├── .gitlab-ci.yml         # Exercício 1: GitLab CI
├── playwright.config.ts
└── package.json
```

---

## Exercício 1 — GitLab CI

**Objetivo:** Implementar a pipeline de testes em uma ferramenta alternativa de Integração Contínua, utilizando o GitLab CI.

**Solução:** arquivo `.gitlab-ci.yml`

```yaml
stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.44.0-jammy
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 1 week
```

**O que acontece nessa pipeline:**
- Usa a imagem oficial do Playwright com todos os browsers já instalados
- Instala as dependências com `npm ci`
- Executa os testes com `npx playwright test`
- Salva o relatório HTML como artefato por 1 semana, disponível mesmo quando os testes falham

---

## Exercício 2 — GitHub Actions com action do Marketplace

**Objetivo:** Explorar as actions disponíveis no [GitHub Marketplace](https://github.com/marketplace?type=actions) e adicionar uma que agregue valor ao fluxo, como relatórios ou notificações.

**Action utilizada:** `actions/upload-artifact@v4` — publica o relatório HTML do Playwright como artefato para download direto no GitHub Actions.

**Solução:** arquivo `.github/workflows/e2e.yml`

```yaml
name: Execucao Manual

on:
  workflow_dispatch:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout do codigo
        uses: actions/checkout@v4

      - name: Instalar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Instalar dependencias
        run: npm ci

      - name: Instalar browsers do Playwright
        run: npx playwright install --with-deps

      - name: Executar testes E2E
        run: npx playwright test

      - name: Publicar relatorio HTML
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**O que acontece nessa pipeline:**
- `workflow_dispatch` permite executar a pipeline manualmente pelo GitHub
- Configura Node.js 20 e instala as dependências
- Instala os browsers do Playwright com `--with-deps`
- Executa os testes
- A action `upload-artifact` do Marketplace publica o relatório HTML como artefato, disponível para download por 7 dias — mesmo quando os testes falham (`if: always()`)

---

## Exercício 3 — Self-hosted Runner

**Objetivo:** Entender o conceito de self-hosted runners, avaliar quando faz sentido utilizá-los e implementar um agente para executar a pipeline.

**O que é um self-hosted runner?**
É uma máquina própria (local ou em servidor) registrada como executor de uma pipeline. Em vez de usar a infraestrutura da plataforma de CI, os jobs rodam no ambiente que você controla.

**Quando faz sentido usar?**
- Quando os testes precisam de um ambiente específico, como browsers instalados localmente ou configurações de rede interna
- Quando o projeto consome muitos minutos do plano gratuito da plataforma
- Quando há restrições de segurança e o código não pode rodar em servidores externos
- Quando a equipe já tem servidores ociosos disponíveis

**Outras plataformas oferecem recursos similares?**
Sim. GitLab tem o GitLab Runner, que funciona da mesma forma — você instala o agente na sua máquina e ele se registra no projeto. O Jenkins também opera nesse modelo por padrão, com controllers e agents. O conceito é o mesmo em todas: você fornece o hardware, a plataforma fornece a orquestração.

**O que escolhi e por quê:**
Optei pelo self-hosted runner do GitHub Actions por já estar usando o GitHub neste projeto. A vantagem prática foi não precisar de uma conta extra ou nova ferramenta — só registrar a minha máquina no repositório. Para um projeto de estudos rodando localmente, faz mais sentido do que pagar por minutos em nuvem ou subir uma VM só para isso.

**Como registrar o runner no seu Mac:**

1. No repositório, acesse **Settings → Actions → Runners → New self-hosted runner**
2. Selecione **macOS** e siga os comandos gerados pelo GitHub (o token é único por repositório)
3. Após o registro, inicie o agente:

```bash
./run.sh
```

4. No workflow, troque `runs-on: ubuntu-latest` por `runs-on: self-hosted`:

```yaml
jobs:
  e2e-tests:
    runs-on: self-hosted
```

A pipeline passa a executar na sua máquina sempre que for disparada.

---

## Como rodar localmente

```bash
npm ci
npx playwright install --with-deps
npx playwright test
```

Para visualizar o relatório após a execução:

```bash
npx playwright show-report
```