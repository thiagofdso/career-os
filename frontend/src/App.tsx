/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { COLUMNS, RADAR_COLUMNS, NETWORKING_COLUMNS, INTERVIEW_COLUMNS } from './constants';
import { KanbanColumn } from './components/Dashboard/KanbanColumn';
import { KanbanCard } from './components/Dashboard/KanbanCard';
import { MOCK_CARDS } from './mockData';
import { MetricsView } from './components/Dashboard/MetricsView';
import { CreateCardForm } from './components/Dashboard/CreateCardForm';
import { InterviewsView } from './components/Dashboard/InterviewsView';
import { JourneyView } from './components/Dashboard/JourneyView';
import { ActionCenter } from './components/Dashboard/ActionCenter';
import { Modal } from './components/ui/Modal';
import { CardDetail } from './components/Dashboard/CardDetail';
import { CareerCard, AgentType, CardStatus } from './types';
import { Search, Filter, Bell, Sparkles, Plus, Menu, X } from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './lib/utils';

export default function App() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CareerCard | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/tasks`);
        const tasks = await res.json();
        const mapped = tasks.map((t: any) => ({
          id: String(t.id),
          type: 'project',
          title: t.title,
          description: t.description || '',
          agentId: t.agent || 'orchestrator',
          status: t.status || 'inbox',
          priority: t.priority || 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          needsApproval: false
        }));
        if (Array.isArray(mapped) && mapped.length) setCards(mapped);
      } catch {}
    })();
  }, []);
const filteredBySearch = cards.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMoveCard = (id: string, targetStatus: CardStatus, updatedContent?: string) => {
    setCards(prev => {
      const updatedCards = prev.map(c => 
        c.id === id ? { 
          ...c, 
          status: targetStatus, 
          needsApproval: targetStatus === CardStatus.WAITING_APPROVAL,
          description: updatedContent !== undefined ? updatedContent : c.description,
          updatedAt: new Date().toISOString()
        } : c
      );

      // Special logic: if a card moves to MONITORING, maybe create a notification or interview card
      // For now, we just implement the transitions requested.
      
      return updatedCards;
    });
    setSelectedCard(null);
  };

  const handleApprove = (id: string, updatedContent?: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    let nextStatus = card.status;

    // Logic for Radar Workflow
    if (card.agentId === AgentType.RADAR) {
      if (card.status === CardStatus.WAITING_APPROVAL) nextStatus = CardStatus.RESUME_REVISION;
    } 
    // Logic for Interview Workflow
    else if (card.agentId === AgentType.INTERVIEW) {
      if (card.status === CardStatus.WAITING_APPROVAL) nextStatus = CardStatus.REPLY_MESSAGE;
    }
    // Logic for Networking Workflow
    else if (card.agentId === AgentType.NETWORKING) {
      if (card.status === CardStatus.WAITING_APPROVAL) nextStatus = CardStatus.SENT;
    }
    // Generic fallback
    else if (card.needsApproval) {
      nextStatus = CardStatus.TRIAGEM; // or some neutral state
    }

    handleMoveCard(id, nextStatus, updatedContent);
  };

  const handleReject = (id: string) => {
    const card = cards.find(c => c.id === id);
    const targetStatus = card?.agentId === AgentType.NETWORKING ? CardStatus.ARCHIVED : CardStatus.REJECTED;
    handleMoveCard(id, targetStatus);
  };

  const handleCreateCard = (data: Omit<CareerCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: CareerCard = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards(prev => [newCard, ...prev]);
    setIsCreateModalOpen(false);
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return (
        <ActionCenter 
          cards={cards} 
          onCardClick={(card) => setSelectedCard(card)} 
        />
      );
    }

    const agentViewMap: Record<string, AgentType> = {
      'radar': AgentType.RADAR,
      'networking': AgentType.NETWORKING,
      'content': AgentType.CONTENT,
      'portfolio': AgentType.PORTFOLIO,
      'inbox': AgentType.INTERVIEW,
      'orchestrator': AgentType.ORCHESTRATOR
    };

    const currentAgentType = agentViewMap[activeView];

    if (activeView === 'dashboard' || currentAgentType) {
      const filteredByAgent = currentAgentType 
        ? filteredBySearch.filter(c => c.agentId === currentAgentType)
        : filteredBySearch;

      let currentColumns = COLUMNS;
      if (activeView === 'radar') currentColumns = RADAR_COLUMNS;
      else if (activeView === 'networking') currentColumns = NETWORKING_COLUMNS;
      else if (activeView === 'inbox') currentColumns = INTERVIEW_COLUMNS;

      return (
        <div className="flex-1 overflow-x-auto kanban-scrollbar pb-4">
          <div className="flex h-full gap-6">
            {currentColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.id}
                title={column.title}
                cards={filteredByAgent.filter(c => c.status === column.id)}
                onCardClick={setSelectedCard}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeView === 'approvals') {
      const approvalCards = filteredBySearch.filter(c => c.needsApproval);
      return (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto py-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Aprovações Pendentes ({approvalCards.length})</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Aprovar Todos</Button>
                <Button variant="primary" size="sm">Processar Fila</Button>
              </div>
            </div>
            
            {approvalCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {approvalCards.map(card => (
                   <div key={card.id} className="w-full">
                     <KanbanCard card={card} onClick={() => setSelectedCard(card)} />
                   </div>
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tudo limpo!</h3>
                <p className="text-gray-500">Não há ações pendentes de aprovação no momento.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'metrics') {
      return <MetricsView onViewJourney={() => setActiveView('journey')} />;
    }

    if (activeView === 'journey') {
      return <JourneyView />;
    }

    if (activeView === 'interviews') {
      return (
        <InterviewsView 
          cards={filteredBySearch}
          onCardClick={setSelectedCard}
        />
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">Módulo em Desenvolvimento</h2>
          <p className="text-sm">A visualização "{activeView}" estará disponível em breve.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setActiveView('dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  };

  const getHeaderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Operações de Carreira', subtitle: `Gerenciando ${cards.length} tarefas críticas em todos os agentes.` };
      case 'approvals':
        return { title: 'Fila de Aprovação', subtitle: 'Ações que exigem sua revisão final antes da execução via MCP.' };
      case 'radar':
        return { title: 'Radar de Oportunidades', subtitle: 'Captura de vagas, monitoramento de mercado e análise de compatibilidade.' };
      case 'networking':
        return { title: 'Networking Estratégico', subtitle: 'Gestão de conexões LinkedIn, parcerias e expansão de rede profissional.' };
      case 'content':
        return { title: 'Conteúdo e Autoridade', subtitle: 'Produção de pautas, posts para LinkedIn e artigos técnicos.' };
      case 'portfolio':
        return { title: 'Portfólio e Projetos', subtitle: 'Gestão de repositórios, documentação e prova social técnica.' };
      case 'inbox':
      case 'interviews':
        return { title: 'Entrevistas e Conversão', subtitle: 'Calendário de reuniões, simulador de IA e roteiros técnicos.' };
      case 'orchestrator':
        return { title: 'Orquestrador Central', subtitle: 'Visão de comando e distribuição de tarefas entre agentes.' };
      case 'metrics':
        return { title: 'Observabilidade', subtitle: 'Métricas de conversão, eficiência e automação do sistema.' };
      case 'journey':
        return { title: 'Jornada Estratégica', subtitle: 'Linha do tempo de evolução e marcos de carreira alcançados.' };
      default:
        return { title: 'CareerOS', subtitle: 'Ajudando você a aumentar renda e posicionamento profissional.' };
    }
  };

  const header = getHeaderContent();

  return (
    <div className="flex h-screen w-full bg-ds-background-100 overflow-hidden font-sans">
      {/* Lado Esquerdo: Sidebar de Navegação */}
      <div className={cn(
        "transition-all duration-300 ease-in-out flex-shrink-0",
        isSidebarOpen ? "w-64" : "w-0 -translate-x-full overflow-hidden"
      )}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Lado Direito: Dashboard Principal */}
      <main className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header Superior */}
        <header className="flex h-16 items-center justify-between border-b border-ds-gray-200 bg-ds-background-100 px-8 ds-shadow-border relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-ds-gray-700 hover:text-ds-gray-1000 rounded-geist hover:bg-ds-gray-100 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-gray-700" size={16} />
              <input 
                type="text" 
                placeholder="Buscar vagas, posts ou tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 py-1.5 pl-10 pr-4 text-sm focus:border-ds-gray-1000 focus:bg-ds-background-100 focus:outline-none transition-all placeholder:text-ds-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {['Feedback', 'Documentação', 'Ajuda'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-ds-gray-700 hover:text-ds-gray-1000 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-ds-gray-200 pl-6">
              <button className="relative p-2 text-ds-gray-700 hover:text-ds-gray-1000 transition-colors">
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ds-red-900 ring-2 ring-ds-background-100" />
              </button>
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Sparkles size={14} className="text-ds-purple" />
                Vercel AI
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6 bg-ds-background-100">
          
          {/* Cabeçalho do Dashboard */}
          <div className="flex items-end justify-between px-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-ds-gray-1000">
                {header.title}
              </h1>
              <p className="text-sm text-ds-gray-700">
                {header.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                Filtros
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={14} />
                Novo Item
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </main>

      {/* Global Modals */}
      <Modal 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
        title={selectedCard?.title || ''}
      >
        {selectedCard && (
          <CardDetail 
            card={selectedCard} 
            onApprove={handleApprove}
            onReject={handleReject}
            onMove={handleMoveCard}
          />
        )}
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Nova Tarefa / Evento"
      >
        <CreateCardForm onSubmit={handleCreateCard} />
      </Modal>
    </div>
  );
}
