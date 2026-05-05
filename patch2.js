import fs from 'fs';

let content = fs.readFileSync('backend/src/server.js', 'utf8');

// Fix the corrupted syntax at the end of the file:
const fix1 = `app.post('/api/events', (req, res) => {
  const { type = 'generic', payload = {} } = req.body || {};
  const result = statements.events.insert.run(type, JSON.stringify(payload));
  res.status(201).json(statements.events.getById.get(result.lastInsertRowid));
app.get('/api/events', (_req, res) => res.json(statements.events.getAll.all()));`;

const replace1 = `app.post('/api/events', (req, res) => {
  const { type = 'generic', payload = {} } = req.body || {};
  const result = statements.events.insert.run(type, JSON.stringify(payload));
  res.status(201).json(statements.events.getById.get(result.lastInsertRowid));
});
app.get('/api/events', (_req, res) => res.json(statements.events.getAll.all()));`;

content = content.replace(fix1, replace1);


const fix2 = `app.get('/api/metrics', (_req, res) => {
  res.json(statements.metrics.get());


const port`;

const replace2 = `app.get('/api/metrics', (_req, res) => {
  res.json(statements.metrics.get());
});

const port`;

content = content.replace(fix2, replace2);

fs.writeFileSync('backend/src/server.js', content, 'utf8');
