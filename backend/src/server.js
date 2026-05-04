import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const db = new Database(process.env.SQLITE_PATH || 'career_os.db');
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'triagem',
  agent TEXT NOT NULL DEFAULT 'orchestrator',
  priority TEXT NOT NULL DEFAULT 'medium',
  needs_approval INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/tasks', (_req, res) => res.json(db.prepare('SELECT * FROM tasks ORDER BY id DESC').all()));
app.post('/api/tasks', (req, res) => {
  const { title, description = '', status = 'triagem', agent = 'orchestrator', priority = 'medium', needsApproval = false } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare('INSERT INTO tasks (title, description, status, agent, priority, needs_approval, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))').run(title, description, status, agent, priority, needsApproval ? 1 : 0);
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});
app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'not found' });
  const next = { ...current, ...req.body };
  db.prepare('UPDATE tasks SET title=?, description=?, status=?, agent=?, priority=?, needs_approval=?, updated_at=datetime(\'now\') WHERE id=?').run(next.title, next.description, next.status, next.agent, next.priority, next.needsApproval ?? next.needs_approval ?? 0, id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});
app.delete('/api/tasks/:id', (req, res) => { db.prepare('DELETE FROM tasks WHERE id=?').run(Number(req.params.id)); res.status(204).end(); });
app.post('/api/events', (req, res) => {
  const { type = 'generic', payload = {} } = req.body || {};
  const result = db.prepare('INSERT INTO events (type, payload) VALUES (?, ?)').run(type, JSON.stringify(payload));
  res.status(201).json(db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid));
});
app.get('/api/events', (_req, res) => res.json(db.prepare('SELECT * FROM events ORDER BY id DESC').all()));
app.delete('/api/events/:id', (req, res) => { db.prepare('DELETE FROM events WHERE id=?').run(Number(req.params.id)); res.status(204).end(); });
app.get('/api/metrics', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) c FROM tasks').get().c;
  const approvals = db.prepare('SELECT COUNT(*) c FROM tasks WHERE needs_approval = 1').get().c;
  const done = db.prepare("SELECT COUNT(*) c FROM tasks WHERE status IN ('sent','done','archived')").get().c;
  res.json({ totalTasks: total, pendingApprovals: approvals, completed: done });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`backend on :${port}`));
