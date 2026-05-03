const API = globalThis.API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  if (res.status === 204) return null;
  return res.json();
}

async function createTask(form) {
  await request('/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: form.title.value,
      description: form.description.value,
      priority: form.priority.value,
      agent: form.agent.value,
      status: 'todo'
    })
  });
}

async function moveTask(id, status) {
  await request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

async function removeTask(id) {
  await request(`/tasks/${id}`, { method: 'DELETE' });
}

function taskCard(task) {
  return `<li>
    <strong>${task.title}</strong> <small>${task.agent} | ${task.priority}</small>
    <div>${task.description || ''}</div>
    <button data-action='move' data-id='${task.id}' data-next='doing'>▶ doing</button>
    <button data-action='move' data-id='${task.id}' data-next='done'>✔ done</button>
    <button data-action='delete' data-id='${task.id}'>🗑</button>
  </li>`;
}

async function load() {
  const [tasks, events, metrics] = await Promise.all([
    request('/tasks'),
    request('/events'),
    request('/metrics')
  ]);

  const cols = ['todo', 'doing', 'done'];
  const board = cols.map((c) => `<section><h2>${c} (${metrics.byStatus[c] || 0})</h2><ul>${tasks.filter((t) => t.status === c).map(taskCard).join('')}</ul></section>`).join('');

  const eventsHtml = `<h2>Eventos (${events.length})</h2><ul>${events.map((e) => `<li>${e.type}</li>`).join('')}</ul>`;
  document.getElementById('app').innerHTML = `
    <form id='task-form'>
      <input name='title' placeholder='Título' required />
      <input name='description' placeholder='Descrição' />
      <select name='priority'><option>low</option><option selected>medium</option><option>high</option></select>
      <input name='agent' placeholder='Agente' required />
      <button type='submit'>Nova tarefa</button>
    </form>
    <div style='display:grid;grid-template-columns:repeat(3,1fr);gap:16px'>${board}</div>
    ${eventsHtml}
  `;

  document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    await createTask(e.target);
    await load();
  };

  document.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === 'move') await moveTask(id, btn.dataset.next);
      if (btn.dataset.action === 'delete') await removeTask(id);
      await load();
    };
  });
}

load();
