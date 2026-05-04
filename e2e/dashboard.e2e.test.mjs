import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// Temporary mock data inside the script since importing from ts files in mjs is tricky without loaders
const MOCK_CARDS = [
  { id: '1', type: 'VAGA', title: 'Senior AI Engineer - Cloud Infrastructure', description: 'Vaga detectada no LinkedIn. Enfoque em arquitetura de agentes e implantação em grande escala.', origin: 'LinkedIn', agentId: 'RADAR', status: 'INBOX', priority: 'HIGH', score: 92, needsApproval: false, metadata: { externalLink: 'https://linkedin.com/jobs/123' } },
  { id: '2', type: 'CONTEUDO', title: 'Post: A Era da Orquestração de Agentes', description: 'Postagem estratégica sugerida para aumentar autoridade técnica em Cloud/IA.', agentId: 'CONTENT', status: 'AGUARDANDO_APROVACAO', priority: 'MEDIUM', needsApproval: true },
  { id: '3', type: 'NETWORKING', title: 'Resposta: Recrutadora da OpenAI', description: 'Resposta sugerida para mensagem direta sobre oportunidade de consultoria.', agentId: 'INTERVIEW', status: 'AGUARDANDO_APROVACAO', priority: 'CRITICAL', needsApproval: true },
  { id: '4', type: 'PROJETO', title: 'Orquestrador MCP - Portfolio MVP', description: 'Projeto de portfólio para demonstrar integração entre agentes e ferramentas externas.', origin: 'GitHub Ideas', agentId: 'PORTFOLIO', status: 'REVISAR_CURRICULO', priority: 'HIGH', needsApproval: false },
  { id: '5', type: 'ENTREVISTA', title: 'Preparo: Entrevista Técnica na Vercel', description: 'Simulação gerada pelo agente de entrevistas focada em React & Edge Computing.', agentId: 'INTERVIEW', status: 'TRIAGEM', priority: 'HIGH', needsApproval: false },
  { id: '6', type: 'VAGA', title: 'Staff Platform Engineer', description: 'Aplicação sugerida com base no score de relevância e histórico de consultoria.', origin: 'Vercel Careers', agentId: 'RADAR', status: 'INSCRICAO', priority: 'MEDIUM', score: 88, needsApproval: false },
  { id: '7', type: 'ENTREVISTA', title: 'Recrutamento Google - 1a Fase', description: 'Entrevista de triagem com recrutador sobre experiência em Distribuited Systems.', agentId: 'INTERVIEW', status: 'AGENDADO', priority: 'CRITICAL', deadline: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2).toISOString(), needsApproval: false },
  { id: '8', type: 'ENTREVISTA', title: 'Simulação: System Design (Agente)', description: 'Sessão de treinamento com o Agente de Entrevistas focada em escalabilidade vertical.', agentId: 'INTERVIEW', status: 'TRIAGEM', priority: 'MEDIUM', deadline: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5).toISOString(), needsApproval: false },
  { id: '9', type: 'ENTREVISTA', title: 'Entrevista Final - Startup Unicórnio', description: 'Conversa final com CTO sobre cultura e roadmap de produto.', agentId: 'INTERVIEW', status: 'AGENDADO', priority: 'HIGH', deadline: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1).toISOString(), needsApproval: false },
  { id: '10', type: 'NETWORKING', title: 'Conexão: Senior Manager na Meta', description: 'Solicitação de conexão personalizada baseada em interesses comuns em infraestrutura.', agentId: 'NETWORKING', status: 'INBOX', priority: 'MEDIUM', needsApproval: false },
  { id: '11', type: 'NETWORKING', title: 'Follow-up: Networking Dinner NYC', description: 'Agradecimento e proposta de call para contato conhecido no evento de networking.', agentId: 'NETWORKING', status: 'AGUARDANDO_APROVACAO', priority: 'HIGH', needsApproval: true },
  { id: '12', type: 'NETWORKING', title: 'Intro: CTO Startup Alvo', description: 'Pedido de introdução via contato em comum para sondagem de cultura.', agentId: 'NETWORKING', status: 'ENVIADO', priority: 'HIGH', needsApproval: false }
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const BACKEND_PORT = 3101;
const FRONTEND_PORT = 3100;
const API = `http://127.0.0.1:${BACKEND_PORT}/api`;

async function waitForHealth() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error('backend not ready');
}

test('dashboard renders seeded backend data and captures screenshots', async () => {
  await mkdir('e2e/screenshots', { recursive: true });

  const backend = spawn('npm', ['run', 'dev'], { cwd: 'backend', stdio: 'inherit', env: { ...process.env, PORT: String(BACKEND_PORT), SQLITE_PATH: 'e2e.db' } });
  await waitForHealth();
  const frontend = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(FRONTEND_PORT)], { cwd: 'frontend', stdio: 'inherit', env: { ...process.env, VITE_API_URL: API } });
  await wait(2500);

  try {
    // Seed mock data
    for (const card of MOCK_CARDS) {
       await fetch(`${API}/v1/task-${card.type.toLowerCase()}`, { 
           method: 'POST', 
           headers: { 'content-type': 'application/json' }, 
           body: JSON.stringify(card) 
       });
    }
    
    await fetch(`${API}/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'seed', payload: { source: 'e2e' } }) });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${FRONTEND_PORT}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const screens = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'approvals', label: 'Fila de Aprovação' },
      { id: 'radar', label: 'Radar de Oportunidades' },
      { id: 'networking', label: 'Networking Estratégico' },
      { id: 'content', label: 'Conteúdo e Autoridade' },
      { id: 'portfolio', label: 'Portfólio e Projetos' },
      { id: 'inbox', label: 'Entrevistas e Conversão' },
      { id: 'orchestrator', label: 'Orquestrador Central' },
      { id: 'interviews', label: 'Entrevistas', exact: true },
      { id: 'metrics', label: 'Métricas de Carreira' },
    ];

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      if (screen.id !== 'dashboard') {
        await page.getByText(screen.label, { exact: screen.exact ?? false }).first().click();
        await page.waitForTimeout(1000);
      }
      const fileIndex = String(i + 1).padStart(2, '0');
      await page.screenshot({ path: `e2e/screenshots/${fileIndex}-${screen.id}.png`, fullPage: true });
    }

    await browser.close();

    const tasksVaga = await (await fetch(`${API}/v1/task-vaga`)).json();
    assert.ok(tasksVaga.some((t) => t.title.includes('Senior AI Engineer')));
  } finally {
    for (const type of ['vaga', 'networking', 'entrevista', 'conteudo', 'projeto', 'orquestrador']) {
        const tasks = await (await fetch(`${API}/v1/task-${type}`)).json().catch(() => []);
        for (const t of tasks) await fetch(`${API}/v1/task-${type}/${t.id}`, { method: 'DELETE' });
    }
    
    const events = await (await fetch(`${API}/events`)).json().catch(() => []);
    for (const e of events) await fetch(`${API}/events/${e.id}`, { method: 'DELETE' });

    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  }
});
