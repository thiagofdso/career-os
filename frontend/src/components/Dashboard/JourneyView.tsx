import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Briefcase, 
  Trophy, 
  ArrowRight,
  Target,
  Users,
  Search
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { RADAR_COMPANIES } from '../../constants';

export const JourneyView: React.FC = () => {
  const milestones = [
    {
      date: 'Maio 2024',
      title: 'Busca de Oportunidades Ativa',
      description: 'Início da orquestração com 4 agentes. Foco em Redes e Distribuited Systems.',
      status: 'current',
      type: 'process'
    },
    {
      date: 'Abril 2024',
      title: 'Refatoração de Portfólio',
      description: 'Agente de Portfólio atualizou 3 repositórios principais com documentação técnica.',
      status: 'completed',
      type: 'achievement'
    },
    {
      date: 'Março 2024',
      title: 'Estratégia de Conteúdo',
      description: 'Lançamento de série de artigos sobre Rust no LinkedIn com 500+ engajamentos.',
      status: 'completed',
      type: 'milestone'
    },
    {
      date: 'Fevereiro 2024',
      title: 'Definição de Objetivo',
      description: 'Transição estabelecida: Desenvolvedor Senior -> Engenheiro de Staff.',
      status: 'completed',
      type: 'start'
    }
  ];

  const goals = [
    { title: 'Entrevistas Técnicas', current: 3, target: 5, color: 'bg-ds-blue-700' },
    { title: 'Networking LinkedIn', current: 45, target: 100, color: 'bg-ds-purple' },
    { title: 'PRs em Open Source', current: 2, target: 4, color: 'bg-ds-green-900' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 kanban-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-ds-background-100 p-6 rounded-geist border border-ds-gray-200 ds-shadow-border">
            <h3 className="text-sm font-bold text-ds-gray-1000 mb-6 uppercase tracking-widest">Objetivos da Jornada</h3>
            <div className="space-y-6">
              {goals.map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-ds-gray-900">{goal.title}</span>
                    <span className="text-ds-gray-700">{goal.current} / {goal.target}</span>
                  </div>
                  <div className="h-2 w-full bg-ds-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full", goal.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ds-background-100 p-6 rounded-geist border border-ds-gray-200 ds-shadow-border">
            <h3 className="text-sm font-bold text-ds-gray-1000 mb-8 uppercase tracking-widest">Cronologia de Evolução</h3>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-ds-gray-100">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-10">
                  <div className={cn(
                    "absolute left-1 top-1.5 h-4 w-4 rounded-full border-2 border-ds-background-100 flex items-center justify-center z-10",
                    m.status === 'completed' ? "bg-ds-green-900" : "bg-ds-blue-700 animate-pulse"
                  )}>
                    {m.status === 'completed' && <CheckCircle2 size={10} className="text-ds-background-100" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-ds-gray-700 uppercase">{m.date}</span>
                      {m.status === 'current' && <Badge variant="priority">Em Foco</Badge>}
                    </div>
                    <h4 className="text-sm font-bold text-ds-gray-1000">{m.title}</h4>
                    <p className="text-xs text-ds-gray-700 leading-relaxed max-w-lg">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-ds-gray-1000 p-6 rounded-geist text-ds-background-100">
            <Trophy className="text-ds-amber-700 mb-4" size={24} />
            <h3 className="text-sm font-bold mb-2">Próximo Milestone</h3>
            <p className="text-xs text-ds-gray-200 mb-4">
              Realizar entrevista técnica final com empresa Tier 1.
            </p>
            <div className="p-3 bg-ds-gray-900 rounded-geist border border-ds-gray-700 text-[10px] flex items-center gap-2">
              <Target size={12} className="text-ds-blue-700" />
              <span>Duração estimada: 12 dias</span>
            </div>
          </div>

          <div className="bg-ds-background-100 p-5 rounded-geist border border-ds-gray-200 ds-shadow-border">
            <h3 className="text-xs font-bold text-ds-gray-1000 uppercase tracking-widest mb-4">Empresas no Radar</h3>
            <div className="space-y-3">
              {RADAR_COMPANIES.map((company) => (
                <div key={company} className="flex items-center justify-between p-2 rounded-md hover:bg-ds-background-200 border border-transparent hover:border-ds-gray-200 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-ds-gray-100 flex items-center justify-center text-[10px] font-bold">
                      {company[0]}
                    </div>
                    <span className="text-xs font-medium text-ds-gray-900">{company}</span>
                  </div>
                  <ArrowRight size={12} className="text-ds-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
