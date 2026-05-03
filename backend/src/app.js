import express from 'express';
import cors from 'cors';

export function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/tasks', (_req, res) => res.json(db.prepare('SELECT * FROM tasks ORDER BY id DESC').all()));
  app.post('/api/tasks', (req, res) => {
    const { title, description = '', priority = 'medium', agent, status = 'todo', sourceEventId = null } = req.body;
    if (!title || !agent) return res.status(400).json({ error: 'title and agent required' });
    const result = db.prepare('INSERT INTO tasks(title,description,priority,agent,status,source_event_id) VALUES(?,?,?,?,?,?)').run(title, description, priority, agent, status, sourceEventId);
    res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id=?').get(result.lastInsertRowid));
  });
  app.patch('/api/tasks/:id', (req, res) => {
    const current = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'not found' });
    const next = { ...current, ...req.body, updated_at: new Date().toISOString() };
    db.prepare('UPDATE tasks SET title=?, description=?, status=?, priority=?, agent=?, updated_at=? WHERE id=?')
      .run(next.title, next.description, next.status, next.priority, next.agent, next.updated_at, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id));
  });
  app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
    res.status(204).end();
  });

  app.post('/api/events', (req, res) => {
    const { type, payload = {} } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });
    const row = db.prepare('INSERT INTO events(type,payload) VALUES(?,?)').run(type, JSON.stringify(payload));
    res.status(201).json(db.prepare('SELECT * FROM events WHERE id=?').get(row.lastInsertRowid));
  });
  app.get('/api/events', (_req, res) => res.json(db.prepare('SELECT * FROM events ORDER BY id DESC').all()));
  app.patch('/api/events/:id', (req, res) => {
    const current = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'not found' });
    const nextType = req.body.type ?? current.type;
    const nextPayload = JSON.stringify(req.body.payload ?? JSON.parse(current.payload));
    db.prepare('UPDATE events SET type=?, payload=? WHERE id=?').run(nextType, nextPayload, req.params.id);
    res.json(db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id));
  });
  app.delete('/api/events/:id', (req, res) => {
    db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
    res.status(204).end();
  });
  app.get('/api/metrics', (_req, res) => {
    const rows = db.prepare('SELECT status, COUNT(*) as total FROM tasks GROUP BY status').all();
    const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.total]));
    res.json({ totalTasks: rows.reduce((a, r) => a + r.total, 0), byStatus });
  });

  return app;
}
