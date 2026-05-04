import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CareerCard, AgentType, Priority } from '../../types';
import { AGENTS } from '../../constants';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  MessageSquare, 
  Clock,
  ExternalLink,
  Plus,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface InterviewsViewProps {
  cards: CareerCard[];
  onCardClick: (card: CareerCard) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({ cards, onCardClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const interviewCards = cards.filter(c => c.deadline);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    return interviewCards.filter(card => {
      if (!card.deadline) return false;
      return isSameDay(parseISO(card.deadline), day);
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col bg-ds-background-100 rounded-geist border border-ds-gray-200 ds-shadow-border overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ds-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-ds-gray-1000 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth}
                className="p-1 hover:bg-ds-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-ds-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hoje
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 border-b border-ds-gray-200 bg-ds-background-200">
          {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((day) => (
            <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-ds-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDay = isToday(day);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "min-h-[100px] border-r border-b border-ds-gray-100 p-2 transition-all cursor-pointer group hover:bg-ds-background-200/50",
                  !isCurrentMonth && "bg-ds-background-200/30 text-ds-gray-700/50",
                  isSelected && "bg-ds-blue-700/5 ring-1 ring-inset ring-ds-blue-700/20"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                   <span className={cn(
                     "text-sm font-bold flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                     isTodayDay ? "bg-ds-gray-1000 text-ds-background-100" : "text-ds-gray-1000",
                     !isCurrentMonth && "opacity-50"
                   )}>
                     {format(day, 'd')}
                   </span>
                   {dayEvents.length > 0 && (
                     <div className="h-1.5 w-1.5 rounded-full bg-ds-blue-700" />
                   )}
                </div>

                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-ds-gray-100 border border-ds-gray-200 truncate flex items-center gap-1"
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", AGENTS[event.agentId].color)} />
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] text-ds-gray-700 font-bold pl-1">
                      + {dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda/Sidebar Section */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-ds-background-100 rounded-geist border border-ds-gray-200 ds-shadow-border p-5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ds-gray-1000 flex items-center gap-2">
                <CalendarIcon size={16} />
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <Badge variant="outline" className="text-[10px] border-ds-gray-200">
                {selectedDayEvents.length} Eventos
              </Badge>
           </div>

           <div className="flex flex-col gap-3">
             {selectedDayEvents.length > 0 ? (
               selectedDayEvents.map(event => (
                 <div 
                    key={event.id} 
                    onClick={() => onCardClick(event)}
                    className="flex flex-col gap-2 p-3 rounded-geist border border-ds-gray-200 bg-ds-background-200/50 hover:bg-ds-background-200 transition-all cursor-pointer group"
                  >
                   <div className="flex justify-between items-start">
                     <span className="text-[10px] font-bold text-ds-gray-700 uppercase tracking-widest">
                       {AGENTS[event.agentId].name}
                     </span>
                     <Badge 
                        variant={event.priority === Priority.CRITICAL ? 'error' : 'priority'}
                        className="text-[8px]"
                      >
                       {event.priority}
                     </Badge>
                   </div>
                   <h4 className="text-sm font-bold text-ds-gray-1000 group-hover:text-ds-blue-700 transition-colors">
                     {event.title}
                   </h4>
                   <div className="flex items-center gap-3 text-[10px] text-ds-gray-700">
                     <div className="flex items-center gap-1">
                       <Clock size={12} />
                       14:00
                     </div>
                     <div className="flex items-center gap-1">
                       <Video size={12} />
                       Online
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="py-12 text-center">
                 <p className="text-xs text-ds-gray-700 font-medium">Nenhum evento agendado para este dia.</p>
                 <Button variant="ghost" size="sm" className="mt-2 gap-2 text-ds-gray-1000">
                   <Plus size={14} />
                   Agendar Manualmente
                 </Button>
               </div>
             )}
           </div>
        </div>

        {/* Quick Actions / Integration */}
        <div className="bg-ds-gray-1000 rounded-geist p-5 text-ds-background-100">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-ds-amber-700" />
            Vercel AI Coaching
          </h3>
          <p className="text-[11px] text-ds-gray-200 leading-relaxed mb-4">
            Inicie uma simulação de entrevista com o Orquestrador Central para se preparar para as reuniões de hoje.
          </p>
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <MessageSquare size={14} />
            Simular Agora
          </Button>
        </div>
      </div>
    </div>
  );
};
