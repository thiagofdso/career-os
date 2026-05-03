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

## SonarQube
### Download
- Baixado: `https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-26.4.0.121862.zip`
- Extraído em `.tools/sonarqube-26.4.0.121862`

### Execução
Tentativas de iniciar SonarQube falharam porque o Elasticsearch não pode rodar como root neste ambiente:
- `java.lang.RuntimeException: can not run elasticsearch as root`

Também não foi possível iniciar como usuário não-root devido à indisponibilidade de Java acessível fora de `/root`.

### Análise Sonar
Foi preparada configuração:
- `sonar-project.properties`
- `scripts-run-sonar.cjs`

Mas análise não executou por `ECONNREFUSED` (servidor SonarQube indisponível).

## Playwright acesso URL solicitada
Tentativa de abrir URL com Playwright falhou por dependência de sistema ausente:
- `libatk-1.0.so.0: cannot open shared object file`

## Issues
Sem servidor SonarQube funcional, não foi possível consultar issues e métricas do Sonar via API neste ambiente.
