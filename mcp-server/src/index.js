export function createApiClient(baseUrl) {
  return (path, options) => fetch(`${baseUrl}${path}`, options).then(async (r) => (r.status === 204 ? { ok: true } : r.json()));
}

export function registerTools(server, j) {
  server.tool('listTasks', {}, async () => ({ content: [{ type: 'text', text: JSON.stringify(await j('/tasks')) }] }));
  server.tool('createTask', { title: String, agent: String }, async ({ title, agent }) => ({ content: [{ type: 'text', text: JSON.stringify(await j('/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, agent }) })) }] }));
  server.tool('updateTask', { id: Number, status: String }, async ({ id, status }) => ({ content: [{ type: 'text', text: JSON.stringify(await j(`/tasks/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) })) }] }));
  server.tool('deleteTask', { id: Number }, async ({ id }) => ({ content: [{ type: 'text', text: JSON.stringify(await j(`/tasks/${id}`, { method: 'DELETE' })) }] }));
  server.tool('listEvents', {}, async () => ({ content: [{ type: 'text', text: JSON.stringify(await j('/events')) }] }));
  server.tool('addEvent', { type: String, payload: Object }, async ({ type, payload }) => ({ content: [{ type: 'text', text: JSON.stringify(await j('/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, payload }) })) }] }));
  server.tool('updateEvent', { id: Number, type: String }, async ({ id, type }) => ({ content: [{ type: 'text', text: JSON.stringify(await j(`/events/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type }) })) }] }));
  server.tool('deleteEvent', { id: Number }, async ({ id }) => ({ content: [{ type: 'text', text: JSON.stringify(await j(`/events/${id}`, { method: 'DELETE' })) }] }));
}
