import React, { useState } from 'react';
import { AgentType, CardType, Priority, CardStatus, CareerCard } from '../../types';
import { AGENTS } from '../../constants';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Calendar, Tag, User, AlignLeft, BarChart } from 'lucide-react';

interface CreateCardFormProps {
  onSubmit: (card: Omit<CareerCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateCardForm: React.FC<CreateCardFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agentId: AgentType.RADAR,
    type: CardType.ORQUESTRADOR,
    priority: Priority.MEDIUM,
    deadline: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: CardStatus.INBOX,
      needsApproval: formData.agentId === AgentType.CONTENT || formData.agentId === AgentType.ORCHESTRATOR,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700">Título do Card</label>
          <input
            required
            placeholder="Ex: Refatorar README do projeto X"
            value={formData.title}
            onChange={e => setFormData(s => ({ ...s, title: e.target.value }))}
            className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-2 text-sm focus:border-ds-gray-1000 focus:bg-ds-background-100 focus:outline-none transition-all"
          />
        </div>

        {/* Agent and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center gap-1.5">
              <User size={12} /> Agente Responsável
            </label>
            <select
              value={formData.agentId}
              onChange={e => setFormData(s => ({ ...s, agentId: e.target.value as AgentType }))}
              className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-2 text-sm appearance-none focus:border-ds-gray-1000 focus:outline-none transition-all cursor-pointer"
            >
              {Object.values(AgentType).map(type => (
                <option key={type} value={type}>{AGENTS[type].name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center gap-1.5">
              <BarChart size={12} /> Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={e => setFormData(s => ({ ...s, priority: e.target.value as Priority }))}
              className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-2 text-sm appearance-none focus:border-ds-gray-1000 focus:outline-none transition-all cursor-pointer"
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center gap-1.5">
            <AlignLeft size={12} /> Descrição / Briefing
          </label>
          <textarea
            required
            placeholder="Descreva o que precisa ser feito..."
            value={formData.description}
            onChange={e => setFormData(s => ({ ...s, description: e.target.value }))}
            className="w-full min-h-[100px] rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-2 text-sm focus:border-ds-gray-1000 focus:bg-ds-background-100 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Deadline and Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center gap-1.5">
              <Calendar size={12} /> Prazo
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={e => setFormData(s => ({ ...s, deadline: e.target.value }))}
              className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-1.5 text-sm focus:border-ds-gray-1000 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ds-gray-700 flex items-center gap-1.5">
              <Tag size={12} /> Tags (separadas por vírgula)
            </label>
            <input
              placeholder="Ex: urgente, linkedin, mvp"
              value={formData.tags}
              onChange={e => setFormData(s => ({ ...s, tags: e.target.value }))}
              className="w-full rounded-geist border border-ds-gray-200 bg-ds-background-200 px-3 py-2 text-sm focus:border-ds-gray-1000 focus:bg-ds-background-100 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-ds-gray-100">
        <Button variant="ghost" type="button" onClick={() => {}}>Descartar</Button>
        <Button variant="primary" type="submit">Criar Card Agora</Button>
      </div>
    </form>
  );
};
