import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Briefcase, 
  MessageCircle, 
  PenTool, 
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Mail,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CareerCard, CardStatus } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  cards: CareerCard[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, cards }) => {
  const approvalCount = useMemo(() => cards.filter(c => c.needsApproval).length, [cards]);
  
  // Dynamic progress calculation (e.g., cards moved out of INBOX / total cards)
  const totalCards = cards.length;
  const completedCards = useMemo(() => cards.filter(c =>
    c.status !== CardStatus.INBOX && 
    c.status !== CardStatus.WAITING_APPROVAL &&
    c.status !== CardStatus.REJECTED &&
    c.status !== CardStatus.ARCHIVED
  ).length, [cards]);
  const progressPercent = useMemo(() => totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0, [totalCards, completedCards]);

  const sections = [
    { title: 'Principal', items: [
      { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
      { name: 'Fila de Aprovação', icon: Mail, id: 'approvals', count: approvalCount },
    ]},
    { title: 'Agentes', items: [
      { name: 'Radar de Oportunidades', icon: Briefcase, id: 'radar', color: 'text-agent-radar' },
      { name: 'Networking Estratégico', icon: Users, id: 'networking', color: 'text-ds-blue-700' },
      { name: 'Conteúdo e Autoridade', icon: PenTool, id: 'content', color: 'text-agent-content' },
      { name: 'Portfólio e Projetos', icon: Layers, id: 'portfolio', color: 'text-agent-portfolio' },
      { name: 'Entrevistas e Conversão', icon: MessageCircle, id: 'inbox', color: 'text-agent-interview' },
      { name: 'Orquestrador Central', icon: Terminal, id: 'orchestrator', color: 'text-ds-gray-1000' },
    ]},
    { title: 'Eventos', items: [
      { name: 'Entrevistas', icon: Calendar, id: 'interviews' },
      { name: 'Métricas de Carreira', icon: TrendingUp, id: 'metrics' },
    ]}
  ];

  return (
    <div className="flex h-screen w-full flex-col border-r border-ds-gray-200 bg-ds-background-100">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 cursor-pointer" onClick={() => onViewChange('dashboard')}>
        <div className="flex h-8 w-8 items-center justify-center rounded-geist bg-ds-gray-1000 text-ds-background-100">
          <Terminal size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tighter text-ds-gray-1000 uppercase">
          CareerOS
        </span>
      </div>

      {/* Stats Summary */}
      <div className="mx-6 mb-8 rounded-geist bg-ds-background-200 p-4 border border-ds-gray-200 ds-shadow-border">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-wider">Avanço Semanal</span>
            <span className="text-xs font-bold text-ds-green-900">+{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-ds-gray-200 overflow-hidden">
             <div className="h-full bg-ds-gray-1000 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-ds-gray-900">
            <span className="font-bold text-ds-gray-1000">{completedCards} de {totalCards}</span> objetivos semanais concluídos.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-ds-gray-700">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-geist px-3 py-1.5 text-sm font-medium transition-all group",
                    activeView === item.id 
                      ? "bg-ds-gray-1000 text-ds-background-100 ds-shadow-border" 
                      : "text-ds-gray-900 hover:bg-ds-gray-100 hover:text-ds-gray-1000"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={cn(item.color)} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                  {item.count && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ds-amber-700 text-[9px] font-black text-ds-gray-1000">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-ds-gray-200">
        <div className="flex items-center gap-3 rounded-geist p-2 hover:bg-ds-background-200 cursor-pointer transition-colors border border-transparent hover:border-ds-gray-200 ds-shadow-border group">
          <div className="h-8 w-8 rounded-full bg-ds-blue-700/10 flex items-center justify-center text-ds-blue-700 font-bold text-xs border border-ds-blue-700/20">
            TS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ds-gray-1000">Thiago S.</span>
            <span className="text-[10px] text-ds-gray-700">Professional Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
