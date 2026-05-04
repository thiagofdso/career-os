import React from 'react';
import { CareerCard, CardStatus } from '../../types';
import { COLUMNS } from '../../constants';
import { KanbanCard } from './KanbanCard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  status: CardStatus;
  title: string;
  cards: CareerCard[];
  onCardClick: (card: CareerCard) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, title, cards, onCardClick }) => {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-ds-gray-1000">{title}</h2>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ds-gray-100 text-[10px] font-bold text-ds-gray-900 border border-ds-gray-200">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-ds-gray-700 hover:text-ds-gray-1000 transition-colors">
            <Plus size={16} />
          </button>
          <button className="p-1 text-ds-gray-700 hover:text-ds-gray-1000 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Cards Area */}
      <div className="flex h-full flex-col gap-3 rounded-geist bg-ds-background-200 ds-shadow-border p-3 overflow-hidden">
        <div className="flex flex-col gap-3 overflow-y-auto kanban-scrollbar pr-1 flex-1">
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-ds-gray-200 rounded-geist">
               <p className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest text-center">
                 Vazio
               </p>
            </div>
          )}
        </div>
        
        {/* Add Card Button (Trello Style) */}
        <button className="flex w-full items-center gap-2 rounded-geist p-2 text-xs font-semibold text-ds-gray-700 hover:bg-ds-gray-100 hover:text-ds-gray-1000 transition-colors mt-1">
          <Plus size={14} />
          Adicionar Card
        </button>
      </div>
    </div>
  );
};
