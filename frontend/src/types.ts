export enum AgentType {
  RADAR = 'RADAR',
  NETWORKING = 'NETWORKING',
  CONTENT = 'CONTENT',
  PORTFOLIO = 'PORTFOLIO',
  INTERVIEW = 'INTERVIEW',
  ORCHESTRATOR = 'ORCHESTRATOR'
}

export enum CardType {
  JOB = 'JOB',
  MESSAGE = 'MESSAGE',
  POST = 'POST',
  INTERVIEW = 'INTERVIEW',
  PROJECT = 'PROJECT',
  TASK = 'TASK'
}

export enum CardStatus {
  INBOX = 'INBOX',
  WAITING_APPROVAL = 'AGUARDANDO_APROVACAO',
  RESUME_REVISION = 'REVISAR_CURRICULO',
  APPLICATION = 'INSCRICAO',
  MONITORING = 'MONITORAMENTO',
  REPLY_MESSAGE = 'RESPONDER_MENSAGEM',
  SCHEDULED = 'AGENDADO',
  CANCELED = 'CANCELADO',
  APPROVED = 'APROVADO',
  REJECTED = 'REPROVADO',
  ARCHIVED = 'ARQUIVADO',
  SENT = 'ENVIADO',
  TRIAGEM = 'TRIAGEM'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface CareerCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  origin?: string;
  agentId: AgentType;
  status: CardStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  tags?: string[];
  score?: number;
  metadata?: Record<string, any>;
  needsApproval: boolean;
}

export interface Agent {
  id: AgentType;
  name: string;
  color: string;
  description: string;
  icon: string;
}
