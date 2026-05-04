# AGENTS Guide

## Ambiente para testes E2E

1. Instale as dependências JavaScript:
   - `npm install`
   - `cd backend && npm install`
   - `cd ../frontend && npm install`

2. Instale o navegador do Playwright:
   - `npx playwright install chromium`

3. Em Ubuntu 24.04+, instale libs de sistema necessárias para Chromium headless:
   - `sudo apt-get update`
   - `sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2t64`

## Executar o E2E

- Rode `npm run test:e2e` na raiz do repositório.
- Os screenshots são gerados em `e2e/screenshots/`.

## Troubleshooting

- Erro de porta ocupada (`EADDRINUSE`): finalize processos antigos de backend/frontend antes de rodar novamente.
- Erro de biblioteca ausente (`libatk-1.0.so.0` e similares): reinstale as libs de sistema acima.
