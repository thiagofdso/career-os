# Career OS - Arquitetura

## Estrutura
- `backend/`: API Express + SQLite local.
- `frontend/`: dashboard operacional integrado via HTTP.
- `mcp-server/`: servidor MCP com operações de tarefas/eventos.

## Modelo de dados (SQLite)
### tabela `events`
- `id`, `type`, `payload` (JSON string), `created_at`.

### tabela `tasks`
- `id`, `title`, `description`, `status`, `priority`, `agent`, `source_event_id`, `created_at`, `updated_at`.

## Endpoints backend
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/metrics`
- `GET /health`

## Frontend integrado
- Criar tarefa (formulário)
- Mover tarefa para `doing`/`done`
- Excluir tarefa
- Exibir eventos
- Exibir métricas por status

## Decisões
1. SQLite local para reduzir fricção de setup.
2. API REST direta para não introduzir camadas desnecessárias.
3. MCP consumindo backend para evitar duplicação de regra.

## Lições aprendidas / erros resolvidos
- Teste frontend falhou inicialmente por diretório inexistente; correção: criar `frontend/test` antes do arquivo.
- O repositório não continha o protótipo prometido; foi necessário reconstruir baseline completo.
