import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface MetricsViewProps {
  onViewJourney: () => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ onViewJourney }) => {
  const stats = [
    { label: 'Vagas Ativas', value: '124', change: '+12%', icon: Briefcase, color: 'text-ds-blue-700', bg: 'bg-ds-blue-700/5' },
    { label: 'Taxa de Resposta', value: '68%', change: '+5%', icon: BarChart3, color: 'text-ds-purple', bg: 'bg-ds-purple/5' },
    { label: 'Entrevistas', value: '12', change: '+2', icon: Target, color: 'text-ds-red-900', bg: 'bg-ds-red-900/5' },
    { label: 'Automações MCP', value: '432', change: '+124', icon: Zap, color: 'text-ds-amber-900', bg: 'bg-ds-amber-700/5' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full kanban-scrollbar">
      <div className="flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-ds-gray-1000 p-8 rounded-geist text-ds-background-100 ds-shadow-border">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Observabilidade de Carreira</h2>
            <p className="text-sm text-ds-gray-200">Métricas de impacto e performance orquestradas por Agentes.</p>
          </div>
          <Button variant="secondary" className="gap-2 self-start md:self-center" onClick={onViewJourney}>
            Ver Jornada Completa
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-ds-background-100 p-5 rounded-geist border border-ds-gray-200 ds-shadow-border flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-geist", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  stat.change.startsWith('+') ? "bg-ds-green-900/10 text-ds-green-900" : "bg-ds-red-900/10 text-ds-red-900"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-ds-gray-1000 tracking-tight">{stat.value}</span>
                <span className="text-[10px] text-ds-gray-700 font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts / Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-ds-background-100 rounded-geist border border-ds-gray-200 ds-shadow-border p-8">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-ds-gray-700 mb-8">Eficiência por Agente</h3>
             <div className="space-y-8">
               {[
                 { name: 'Radar de Oportunidades', color: 'bg-agent-radar', value: 85 },
                 { name: 'Conteúdo e Autoridade', color: 'bg-agent-content', value: 92 },
                 { name: 'Entrevistas e Conversão', color: 'bg-agent-interview', value: 74 },
                 { name: 'Portfólio e Projetos', color: 'bg-agent-portfolio', value: 65 },
               ].map(agent => (
                 <div key={agent.name} className="flex flex-col gap-3">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-ds-gray-900">{agent.name}</span>
                     <span className="text-ds-gray-1000">{agent.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-ds-gray-100 rounded-full overflow-hidden">
                     <div className={cn("h-full rounded-full transition-all duration-1000", agent.color)} style={{ width: `${agent.value}%` }} />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-ds-background-100 border border-ds-gray-200 rounded-geist p-10 ds-shadow-border flex flex-col items-center justify-center text-center">
             <div className="h-16 w-16 rounded-full bg-ds-blue-700/10 flex items-center justify-center text-ds-blue-700 mb-6 ds-shadow-border">
               <TrendingUp size={32} />
             </div>
             <h3 className="text-xl font-bold text-ds-gray-1000">Aceleração Profissional</h3>
             <p className="text-sm text-ds-gray-700 max-w-xs mt-4 leading-relaxed">
               Seus objetivos estão avançando <span className="text-ds-green-900 font-bold">12% mais rápido</span> do que na semana anterior.
             </p>
             <Button variant="ghost" className="mt-8 gap-2 text-ds-blue-700" onClick={onViewJourney}>
               Explorar Jornada Estratégica
               <ArrowRight size={16} />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
