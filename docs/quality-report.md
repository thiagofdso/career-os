# Relatório de Qualidade

## Cobertura local (c8)
Comando executado:
- `npx c8 --reporter=text --reporter=lcov --reports-dir coverage npm test`

Resultado:
- Statements: **90.72%**
- Branches: **79.16%**
- Functions: **75%**
- Lines: **90.72%**

Arquivo gerado:
- `coverage/lcov.info`

## SonarQube (nova tentativa)
### Download
- URL acessada: `https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-26.4.0.121862.zip`
- Binário baixado e extraído em `.tools/sonarqube-26.4.0.121862`.

### Execução
- Início como root falha (Elasticsearch não roda como root).
- Início como usuário `sonarqube` com `SONAR_JAVA_PATH=/usr/bin/java` funcionou e processo subiu.
- Endpoint `GET /api/system/status` permaneceu em `STARTING` durante as tentativas.

### Scanner
- Configuração preparada em `sonar-project.properties` e `scripts-run-sonar.cjs`.
- Execução do scanner retornou erro de compatibilidade/endpoint:
  - tentativa em `/api/v2/analysis/version` retornando 404.
- Sem status `UP`, não foi possível concluir análise e publicar métricas.

## Playwright (nova tentativa)
- Dependências de sistema instaladas (`libatk`, `libgbm`, etc).
- Acesso via Playwright à URL solicitada foi tentado.
- Resultado:
  - primeiro erro TLS (`ERR_CERT_AUTHORITY_INVALID`),
  - depois evento de download direto (`Download is starting`) sem página HTML para screenshot.

## Issues e métricas Sonar
Sem análise concluída no SonarQube, não foi possível extrair relatório final de issues (`/api/issues/search`) e métricas (`/api/measures/component`).
