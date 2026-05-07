import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const db = new Database(process.env.SQLITE_PATH || 'career_os.db');

const tables = ['vaga', 'networking', 'entrevista', 'conteudo', 'projeto', 'orquestrador'];

import { parseTask } from "./utils.js";


tables.forEach(table => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      origin TEXT,
      agentId TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      deadline TEXT,
      tags TEXT,
      score INTEGER,
      metadata TEXT,
      needsApproval INTEGER NOT NULL DEFAULT 0
    );
  `);
});

db.exec(`
CREATE TABLE IF NOT EXISTS metrics_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  totalTasks INTEGER NOT NULL DEFAULT 0,
  pendingApprovals INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO metrics_cache (id, totalTasks, pendingApprovals, completed) VALUES (1, 0, 0, 0);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

let initTotalTasks = 0;
let initPendingApprovals = 0;
let initCompleted = 0;

tables.forEach(table => {
  initTotalTasks += db.prepare(`SELECT COUNT(*) c FROM task_${table}`).get().c;
  initPendingApprovals += db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE needsApproval = 1`).get().c;
  initCompleted += db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE status IN ('SENT','APPROVED','ARCHIVED')`).get().c;

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS task_${table}_insert AFTER INSERT ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        totalTasks = totalTasks + 1,
        pendingApprovals = pendingApprovals + NEW.needsApproval,
        completed = completed + CASE WHEN NEW.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;

    CREATE TRIGGER IF NOT EXISTS task_${table}_update AFTER UPDATE ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        pendingApprovals = pendingApprovals - OLD.needsApproval + NEW.needsApproval,
        completed = completed
          - CASE WHEN OLD.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
          + CASE WHEN NEW.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;

    CREATE TRIGGER IF NOT EXISTS task_${table}_delete AFTER DELETE ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        totalTasks = totalTasks - 1,
        pendingApprovals = pendingApprovals - OLD.needsApproval,
        completed = completed - CASE WHEN OLD.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;
  `);
});

db.prepare(`UPDATE metrics_cache SET totalTasks = ?, pendingApprovals = ?, completed = ? WHERE id = 1`).run(initTotalTasks, initPendingApprovals, initCompleted);


const statements = {
  tasks: {},
  metrics: db.prepare('SELECT totalTasks, pendingApprovals, completed FROM metrics_cache WHERE id = 1'),
  events: {
    insert: db.prepare('INSERT INTO events (type, payload) VALUES (?, ?)'),
    getById: db.prepare('SELECT * FROM events WHERE id = ?'),
    getAll: db.prepare('SELECT * FROM events ORDER BY id DESC'),
    delete: db.prepare('DELETE FROM events WHERE id=?')
  }
};

tables.forEach(table => {
  statements.tasks[table] = {
    getAll: db.prepare(`SELECT * FROM task_${table} ORDER BY id DESC`),
    getById: db.prepare(`SELECT * FROM task_${table} WHERE id = ?`),
    insert: db.prepare(`
      INSERT INTO task_${table}
      (type, title, description, origin, agentId, status, priority, deadline, tags, score, metadata, needsApproval, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `),
    update: db.prepare(`
      UPDATE task_${table}
      SET type=?, title=?, description=?, origin=?, agentId=?, status=?, priority=?, deadline=?, tags=?, score=?, metadata=?, needsApproval=?, updatedAt=datetime('now')
      WHERE id=?
    `),
    delete: db.prepare(`DELETE FROM task_${table} WHERE id=?`),
    count: db.prepare(`SELECT COUNT(*) c FROM task_${table}`),
    countNeedsApproval: db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE needsApproval = 1`),
    countCompleted: db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE status IN ('SENT','APPROVED','ARCHIVED')`)
  };
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

tables.forEach(table => {
  const s = statements.tasks[table];

  app.get(`/api/v1/task-${table}`, (_req, res) => {
    const tasks = s.getAll.all();
    res.json(tasks.map(parseTask));
  });

  app.post(`/api/v1/task-${table}`, (req, res) => {
    const {
      type, title, description = '', origin, agentId, status, priority,
      deadline, tags, score, metadata, needsApproval = false
    } = req.body || {};
    
    if (!title) return res.status(400).json({ error: 'title is required' });
    
    const result = s.insert.run(
      type, title, description, origin, agentId, status, priority, deadline,
      tags ? JSON.stringify(tags) : null,
      score,
      metadata ? JSON.stringify(metadata) : null,
      needsApproval ? 1 : 0
    );
    
    const t = s.getById.get(result.lastInsertRowid);
    res.status(201).json(parseTask(t));
  });

  app.patch(`/api/v1/task-${table}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const current = s.getById.get(id);
    if (!current) return res.status(404).json({ error: 'not found' });
    
    const next = { 
      ...parseTask(current),
      ...req.body 
    };
    
    s.update.run(
      next.type, next.title, next.description, next.origin, next.agentId, next.status, next.priority, next.deadline,
      next.tags ? JSON.stringify(next.tags) : null,
      next.score,
      next.metadata ? JSON.stringify(next.metadata) : null,
      next.needsApproval ? 1 : 0,
      id
    );
    
    const t = s.getById.get(id);
    res.json(parseTask(t));
  });

  app.delete(`/api/v1/task-${table}/:id`, (req, res) => {
    s.delete.run(Number(req.params.id));
    res.status(204).end();
  });
});

app.post('/api/events', (req, res) => {
  const { type = 'generic', payload = {} } = req.body || {};
  const result = statements.events.insert.run(type, JSON.stringify(payload));
  res.status(201).json(statements.events.getById.get(result.lastInsertRowid));
});
app.get('/api/events', (_req, res) => res.json(statements.events.getAll.all()));
app.delete('/api/events/:id', (req, res) => { statements.events.delete.run(Number(req.params.id)); res.status(204).end(); });

app.get('/api/metrics', (_req, res) => {
  res.json(statements.metrics.get());
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`backend on :${port}`));
