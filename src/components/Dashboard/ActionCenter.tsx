import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Filter
} from 'lucide-react';
import { CareerCard, AgentType, CardStatus } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Button } from '../ui/Button';

interface ActionCenterProps {
  cards: CareerCard[];
  onCardClick: (card: CareerCard) => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({ cards, onCardClick }) => {
  const pendingCards = cards.filter(c => c.needsApproval || c.status === CardStatus.WAITING_APPROVAL);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 kanban-scrollbar">
      <div className="bg-ds-amber-700/5 border border-ds-amber-700/20 p-6 rounded-geist flex items-start gap-4">
        <div className="p-2 bg-ds-amber-700 rounded-lg text-ds-background-100">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ds-gray-1000">Ações Pendentes</h3>
          <p className="text-xs text-ds-gray-700 mt-1 max-w-xl">
            Estes itens exigem sua revisão para que os Agentes possam prosseguir com a execução via MCP ou comunicação externa.
          </p>
        </div>
      </div>

      {pendingCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-ds-background-200 rounded-geist border border-dashed border-ds-gray-200">
          <CheckCircle2 size={40} className="text-ds-green-900 mb-4" />
          <h3 className="text-lg font-bold text-ds-gray-1000">Tudo em dia!</h3>
          <p className="text-sm text-ds-gray-700">Seus agentes estão trabalhando em segundo plano. Novas ações aparecerão aqui assim que precisarem de você.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onCardClick(card)}
              className="cursor-pointer"
            >
              <div className="relative">
                <div className="absolute -top-2 -right-2 z-20 bg-ds-amber-700 text-ds-background-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-lg">
                  Requer Aprovação
                </div>
                <KanbanCard card={card} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
