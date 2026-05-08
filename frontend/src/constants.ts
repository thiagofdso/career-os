import { AgentType, CardStatus, Priority, Agent } from './types';

export const AGENTS: Record<AgentType, Agent> = {
  [AgentType.RADAR]: {
    id: AgentType.RADAR,
    name: 'Radar de Oportunidades',
    color: 'bg-agent-radar',
    description: 'Encontra vagas e analisa compatibilidade.',
    icon: 'Radar'
  },
  [AgentType.NETWORKING]: {
    id: AgentType.NETWORKING,
    name: 'Networking Estratégico',
    color: 'bg-ds-blue-700',
    description: 'Expande rede LinkedIn e gera conexões.',
    icon: 'Users'
  },
  [AgentType.CONTENT]: {
    id: AgentType.CONTENT,
    name: 'Conteúdo e Autoridade',
    color: 'bg-agent-content',
    description: 'Gera posts e artigos de autoridade.',
    icon: 'PenTool'
  },
  [AgentType.PORTFOLIO]: {
    id: AgentType.PORTFOLIO,
    name: 'Portfólio e Projetos',
    color: 'bg-agent-portfolio',
    description: 'Gere projetos e documentação GitHub.',
    icon: 'Github'
  },
  [AgentType.INTERVIEW]: {
    id: AgentType.INTERVIEW,
    name: 'Entrevistas e Conversão',
    color: 'bg-agent-interview',
    description: 'Prepara e simula entrevistas.',
    icon: 'MessageSquare'
  },
  [AgentType.ORCHESTRATOR]: {
    id: AgentType.ORCHESTRATOR,
    name: 'Orquestrador Central',
    color: 'bg-ds-gray-1000',
    description: 'Coordena o fluxo de trabalho.',
    icon: 'Settings'
  }
};

export const RADAR_COLUMNS = [
  { id: CardStatus.INBOX, title: 'Vagas Descobertas' },
  { id: CardStatus.WAITING_APPROVAL, title: 'Aprovação' },
  { id: CardStatus.RESUME_REVISION, title: 'Adaptação CV' },
  { id: CardStatus.APPLICATION, title: 'Inscrição' },
  { id: CardStatus.MONITORING, title: 'Monitoramento' },
  { id: CardStatus.APPROVED, title: 'Aprovadas' },
  { id: CardStatus.REJECTED, title: 'Reprovadas' }
];

export const NETWORKING_COLUMNS = [
  { id: CardStatus.INBOX, title: 'Entrada' },
  { id: CardStatus.WAITING_APPROVAL, title: 'Aprovação' },
  { id: CardStatus.SENT, title: 'Enviados' },
  { id: CardStatus.ARCHIVED, title: 'Arquivados' }
];

export const INTERVIEW_COLUMNS = [
  { id: CardStatus.INBOX, title: 'Entrada' },
  { id: CardStatus.WAITING_APPROVAL, title: 'Aprovação' },
  { id: CardStatus.REPLY_MESSAGE, title: 'Responder' },
  { id: CardStatus.SCHEDULED, title: 'Entrevistas' },
  { id: CardStatus.APPROVED, title: 'Aprovados' },
  { id: CardStatus.REJECTED, title: 'Reprovados' }
];

export const COLUMNS = [
  { id: CardStatus.INBOX, title: 'Entrada / Inbox' },
  { id: CardStatus.WAITING_APPROVAL, title: 'Aprovação' },
  { id: CardStatus.RESUME_REVISION, title: 'Processando' },
  { id: CardStatus.SCHEDULED, title: 'Agendado' },
  { id: CardStatus.APPROVED, title: 'Finalizados' }
];

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-600',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-600',
  [Priority.HIGH]: 'bg-orange-100 text-orange-600',
  [Priority.CRITICAL]: 'bg-red-100 text-red-600'
};

export const RADAR_COMPANIES = ['Stripe', 'Vercel', 'Linear', 'OpenAI'];
