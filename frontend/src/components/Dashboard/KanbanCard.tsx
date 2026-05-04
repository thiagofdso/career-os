import React from 'react';
import { motion } from 'motion/react';
import { CareerCard, AgentType } from '../../types';
import { AGENTS, PRIORITY_COLORS } from '../../constants';
import { Badge } from '../ui/Badge';
import { 
  Radar, 
  PenTool, 
  Github, 
  MessageSquare, 
  Settings, 
  Clock, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AgentIcons: Record<AgentType, any> = {
  [AgentType.RADAR]: Radar,
  [AgentType.NETWORKING]: Users,
  [AgentType.CONTENT]: PenTool,
  [AgentType.PORTFOLIO]: Github,
  [AgentType.INTERVIEW]: MessageSquare,
  [AgentType.ORCHESTRATOR]: Settings,
};

interface KanbanCardProps {
  card: CareerCard;
  onClick?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onClick }) => {
  const agent = AGENTS[card.agentId];
  const Icon = AgentIcons[card.agentId];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-geist border bg-ds-background-100 p-3 shadow-sm transition-all hover:shadow-md ds-shadow-border cursor-grab active:cursor-grabbing",
        card.needsApproval ? "border-ds-amber-700 ring-1 ring-ds-amber-700/10" : "border-ds-gray-200"
      )}
    >
      {/* Card Left Highlight */}
      <div 
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full",
          card.needsApproval ? "bg-ds-amber-900" : agent.color
        )} 
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-full text-ds-background-100", agent.color)}>
            <Icon size={12} />
          </div>
          <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">
            {agent.name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-ds-gray-700">
          <Clock size={10} />
          <span>2h</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-ds-gray-1000 leading-tight">
          {card.title}
        </h3>
        <p className="text-xs text-ds-gray-900 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 items-center">
        {card.origin && (
          <Badge variant="outline" className="text-[10px] lowercase py-0 px-1 border-ds-gray-200">
            {card.origin}
          </Badge>
        )}
        {card.score && (
          <Badge 
            variant="default" 
            className={cn(
              "text-[10px]",
              card.score > 80 ? "text-ds-green-900 bg-ds-green-900/10" : "text-ds-amber-900 bg-ds-amber-700/10"
            )}
          >
            Match: {card.score}%
          </Badge>
        )}
        <Badge className={cn("text-[10px]", PRIORITY_COLORS[card.priority])}>
          {card.priority}
        </Badge>
      </div>

      {/* Footer / Actions */}
      <div className="pt-2 border-t border-ds-gray-100 flex items-center justify-between">
        {card.needsApproval ? (
          <button className="flex w-full items-center justify-center gap-1.5 rounded-geist bg-ds-amber-700 py-1.5 text-[11px] font-bold text-ds-gray-1000 transition-transform active:scale-95 hover:bg-ds-amber-700/90">
            Revisar e Aprovar
            <ChevronRight size={12} />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">
              {card.status.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-1.5">
               {card.metadata?.externalLink && (
                 <button className="p-1 text-ds-gray-700 hover:text-ds-blue-700 transition-colors">
                   <ExternalLink size={14} />
                 </button>
               )}
               <button className="p-1 text-ds-gray-700 hover:text-ds-green-900 transition-colors">
                 <CheckCircle2 size={14} />
               </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
