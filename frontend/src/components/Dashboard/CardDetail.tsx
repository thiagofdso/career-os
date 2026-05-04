import React, { useState } from 'react';
import { CareerCard, AgentType, CardStatus } from '../../types';
import { AGENTS } from '../../constants';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  History, 
  Info, 
  Zap, 
  Send, 
  Trash2, 
  Calendar, 
  Globe, 
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CardDetailProps {
  card: CareerCard;
  onApprove: (id: string, updatedContent?: string) => void;
  onReject: (id: string) => void;
  onMove: (id: string, targetStatus: CardStatus, updatedContent?: string) => void;
}

export const CardDetail: React.FC<CardDetailProps> = ({ card, onApprove, onReject, onMove }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'suggestion' | 'history'>('suggestion');
  const [suggestionContent, setSuggestionContent] = useState(card.description);
  const agent = AGENTS[card.agentId];

  const tabs = [
    { id: 'suggestion', label: 'Ação Sugerida', icon: Zap },
    { id: 'info', label: 'Informações', icon: Info },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  const renderWorkflowActions = () => {
    // 1. Job Radar Workflow
    if (card.agentId === AgentType.RADAR) {
      switch (card.status) {
        case CardStatus.INBOX:
          return (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onMove(card.id, CardStatus.REJECTED)}>Descartar Vaga</Button>
              <Button variant="approval" onClick={() => onMove(card.id, CardStatus.WAITING_APPROVAL)}>Mover para Aprovação</Button>
            </div>
          );
        case CardStatus.WAITING_APPROVAL:
          return (
            <div className="flex gap-3">
              <Button variant="ghost" className="text-ds-red-900" onClick={() => onReject(card.id)}>Reprovar</Button>
              <Button variant="approval" className="gap-2" onClick={() => onMove(card.id, CardStatus.RESUME_REVISION, suggestionContent)}>
                <CheckCircle2 size={16} />
                Aprovar Vaga
              </Button>
            </div>
          );
        case CardStatus.RESUME_REVISION:
          return (
            <div className="flex flex-col gap-3 w-full">
               <div className="p-3 bg-ds-blue-700/5 border border-ds-blue-700/10 rounded-geist text-[11px] text-ds-blue-700 font-medium">
                 O Agente está adaptando seu currículo para esta vaga específica...
               </div>
               <Button variant="primary" className="w-full gap-2" onClick={() => onMove(card.id, CardStatus.APPLICATION)}>
                 Avançar para Inscrição
               </Button>
            </div>
          );
        case CardStatus.APPLICATION:
          return (
            <Button variant="approval" className="w-full gap-2" onClick={() => onMove(card.id, CardStatus.MONITORING)}>
              <ArrowRight size={16} />
              Confirmar Inscrição Realizada
            </Button>
          );
        case CardStatus.MONITORING:
          return (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="ghost" className="text-ds-red-900 border border-ds-red-900/20" onClick={() => onMove(card.id, CardStatus.REJECTED)}>
                <XCircle size={16} className="mr-2" />
                Fui Reprovado
              </Button>
              <Button variant="approval" onClick={() => onMove(card.id, CardStatus.APPROVED)}>
                <CheckCircle2 size={16} className="mr-2" />
                Fui Aprovado
              </Button>
            </div>
          );
      }
    }

    // 2. Interview Workflow
    if (card.agentId === AgentType.INTERVIEW) {
      switch (card.status) {
        case CardStatus.INBOX:
          return (
            <div className="flex flex-col gap-3 w-full">
              <div className="p-3 bg-ds-amber-700/5 border border-ds-amber-700/10 rounded-geist text-[11px] text-ds-amber-900 font-medium">
                Agente analisando agenda e sugerindo melhor data...
              </div>
              <Button variant="approval" className="w-full" onClick={() => onMove(card.id, CardStatus.WAITING_APPROVAL)}>Ver Sugestão</Button>
            </div>
          );
        case CardStatus.WAITING_APPROVAL:
          return (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="gap-2" onClick={() => onMove(card.id, CardStatus.INBOX)}>
                <RotateCcw size={16} />
                Mudar Data
              </Button>
              <Button variant="approval" className="gap-2" onClick={() => onMove(card.id, CardStatus.REPLY_MESSAGE, suggestionContent)}>
                <CheckCircle2 size={16} />
                Aprovar Data
              </Button>
            </div>
          );
        case CardStatus.REPLY_MESSAGE:
          return (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="ghost" className="text-ds-red-900 border border-ds-red-900/20" onClick={() => onMove(card.id, CardStatus.CANCELED)}>
                <XCircle size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button variant="approval" onClick={() => onMove(card.id, CardStatus.SCHEDULED)}>
                <Calendar size={16} className="mr-2" />
                Agendado
              </Button>
            </div>
          );
        case CardStatus.SCHEDULED:
          return (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="ghost" className="text-ds-red-900 border border-ds-red-900/20" onClick={() => onMove(card.id, CardStatus.REJECTED)}>
                <XCircle size={16} className="mr-2" />
                Reprovado
              </Button>
              <Button variant="approval" onClick={() => onMove(card.id, CardStatus.APPROVED)}>
                <Trophy size={16} className="mr-2" />
                Aprovado!
              </Button>
            </div>
          );
      }
    }

    // 3. Networking Workflow
    if (card.agentId === AgentType.NETWORKING) {
      switch (card.status) {
        case CardStatus.INBOX:
          return (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onMove(card.id, CardStatus.ARCHIVED)}>Ignorar</Button>
              <Button variant="approval" onClick={() => onMove(card.id, CardStatus.WAITING_APPROVAL)}>Filtrar para Aprovação</Button>
            </div>
          );
        case CardStatus.WAITING_APPROVAL:
          return (
            <div className="flex gap-3">
              <Button variant="ghost" className="text-ds-red-900" onClick={() => onMove(card.id, CardStatus.ARCHIVED)}>Arquivar</Button>
              <Button variant="approval" className="gap-2" onClick={() => onMove(card.id, CardStatus.SENT, suggestionContent)}>
                <ArrowRight size={16} />
                Aprovar e Enviar
              </Button>
            </div>
          );
        case CardStatus.SENT:
          return (
            <div className="p-3 bg-ds-green-900/5 border border-ds-green-900/10 rounded-geist text-[11px] text-ds-green-900 font-bold text-center w-full uppercase tracking-widest">
              Convite Enviado / Respondido
            </div>
          );
      }
    }

    // Default Generic Actions
    return (
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setActiveTab('info')}>Ver Logs</Button>
        <Button variant="approval" className="gap-2" onClick={() => onApprove(card.id, suggestionContent)}>
          <Send size={16} />
          Aprovar e Disparar
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner - Agent Info */}
      <div className={cn("flex items-center justify-between p-4 rounded-geist", agent.color + "/10 border border-" + agent.color + "/20")}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full text-ds-background-100", agent.color)}>
             <Globe size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ds-gray-1000 uppercase tracking-widest">{agent.name}</h4>
            <p className="text-xs text-ds-gray-700 uppercase tracking-widest font-bold">{card.type}</p>
          </div>
        </div>
        <Badge variant={card.needsApproval ? 'warning' : 'default'} className="uppercase text-[9px] font-bold tracking-widest">
          {card.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ds-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-all focus:outline-none",
              activeTab === tab.id
                ? "border-ds-gray-1000 text-ds-gray-1000"
                : "border-transparent text-ds-gray-700 hover:text-ds-gray-1000 hover:border-ds-gray-200"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'suggestion' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center justify-between">
                Rascunho Sugerido
                <Badge variant="outline" className="lowercase font-normal border-ds-gray-200">Editável</Badge>
              </label>
              <textarea
                value={suggestionContent}
                onChange={(e) => setSuggestionContent(e.target.value)}
                className="w-full min-h-[150px] rounded-geist border border-ds-gray-200 bg-ds-background-200 p-4 font-sans text-sm focus:border-ds-gray-1000 focus:bg-ds-background-100 focus:outline-none transition-all resize-none shadow-inner"
              />
            </div>
            
            {card.needsApproval && (
              <div className="p-4 rounded-geist bg-ds-amber-700/10 border border-ds-amber-700/20 flex gap-3">
                <AlertCircle className="text-ds-amber-900 shrink-0" size={18} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-ds-amber-900">Necessária Aprovação Visual</p>
                  <p className="text-[11px] text-ds-amber-900/80">O Agente não tem permissão para disparar esta ação externamente sem sua revisão final do texto acima.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
             <div className="flex flex-col gap-1 p-3 rounded-geist border border-ds-gray-100 bg-ds-background-200">
               <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">Origem</span>
               <span className="text-sm font-medium text-ds-gray-1000">{card.origin || 'Não especificado'}</span>
             </div>
             <div className="flex flex-col gap-1 p-3 rounded-geist border border-ds-gray-100 bg-ds-background-200">
               <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">Prioridade</span>
               <Badge className="w-fit" variant="priority">{card.priority}</Badge>
             </div>
             <div className="flex flex-col gap-1 p-3 rounded-geist border border-ds-gray-100 bg-ds-background-200">
               <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">Criado em</span>
               <div className="flex items-center gap-1.5 text-xs text-ds-gray-1000 uppercase font-medium">
                 <Calendar size={12} />
                 {new Date(card.createdAt).toLocaleDateString()}
               </div>
             </div>
             {card.score && (
               <div className="flex flex-col gap-1 p-3 rounded-geist border border-ds-gray-100 bg-ds-background-200">
                 <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">Score de Aderência</span>
                 <span className="text-sm font-bold text-ds-green-900">{card.score}%</span>
               </div>
             )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
             <div className="space-y-4">
               {[
                 { date: 'Há 2h', author: 'Agent Orchestrator', action: 'Criou o card e atribuiu ao Radar' },
                 { date: 'Há 1h', author: 'Agent Radar', action: 'Resumiu rascunho de vaga e sugeriu ação' },
               ].map((log, i) => (
                 <div key={i} className="flex gap-3 items-start border-l-2 border-ds-gray-100 pl-4 relative">
                   <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-ds-gray-200" />
                   <div className="flex flex-col">
                     <span className="text-[11px] text-ds-gray-700 font-bold tracking-tight">{log.date} • {log.author}</span>
                     <p className="text-xs text-ds-gray-900">{log.action}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-ds-gray-100">
        <Button variant="ghost" className="text-ds-red-900 hover:bg-ds-red-900/10 hover:text-ds-red-900 gap-2 font-bold text-xs" onClick={() => onReject(card.id)}>
          <Trash2 size={16} />
          Arquivar
        </Button>
        {renderWorkflowActions()}
      </div>
    </div>
  );
};
