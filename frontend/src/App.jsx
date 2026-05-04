import React, { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || globalThis.API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  if (res.status === 204) return null;
  return res.json();
}

export function App() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({ byStatus: {} });
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', agent: '' });

  async function load() {
    const [nextTasks, nextEvents, nextMetrics] = await Promise.all([
      request('/tasks'),
      request('/events'),
      request('/metrics')
    ]);
    setTasks(nextTasks);
    setEvents(nextEvents);
    setMetrics(nextMetrics);
  }

  useEffect(() => { load(); }, []);

  async function onCreateTask(e) {
    e.preventDefault();
    await request('/tasks', { method: 'POST', body: JSON.stringify({ ...form, status: 'todo' }) });
    setForm({ title: '', description: '', priority: 'medium', agent: '' });
    await load();
  }

  async function moveTask(id, status) {
    await request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  }

  async function removeTask(id) {
    await request(`/tasks/${id}`, { method: 'DELETE' });
    await load();
  }

  const cols = ['todo', 'doing', 'done'];

  return (
    <main>
      <h1>CareerOS Dashboard</h1>
      <form onSubmit={onCreateTask}>
        <input required placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
        </select>
        <input required placeholder="Agente" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} />
        <button type="submit">Nova tarefa</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {cols.map((column) => (
          <section key={column}>
            <h2>{column} ({metrics.byStatus?.[column] || 0})</h2>
            <ul>
              {tasks.filter((t) => t.status === column).map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong> <small>{task.agent} | {task.priority}</small>
                  <div>{task.description || ''}</div>
                  <button onClick={() => moveTask(task.id, 'doing')}>▶ doing</button>
                  <button onClick={() => moveTask(task.id, 'done')}>✔ done</button>
                  <button onClick={() => removeTask(task.id)}>🗑</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2>Eventos ({events.length})</h2>
      <ul>{events.map((event) => <li key={event.id}>{event.type}</li>)}</ul>
    </main>
  );
}
