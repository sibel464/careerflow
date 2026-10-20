import React, { useState } from 'react';
import { format, parseISO, isBefore, startOfDay, isToday, isTomorrow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, Trash2, Flag, CalendarDays } from 'lucide-react';
import { StudyTask, Subject } from '../../Utils/study';
import { cn } from '../../Utils/classNames';

export const dueLabel = (due: string) => {
  const d = parseISO(due);
  if (isToday(d)) return 'Bugün';
  if (isTomorrow(d)) return 'Yarın';
  return format(d, 'd MMM EEE', { locale: tr });
};

interface TaskRowProps {
  task: StudyTask;
  subject?: Subject;
  onToggle: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

/** A single to-do with a satisfying check animation. */
export const TaskRow: React.FC<TaskRowProps> = ({ task, subject, onToggle, onDelete, compact }) => {
  const [popping, setPopping] = useState(false);
  const overdue = !task.done && task.due && isBefore(parseISO(task.due), startOfDay(new Date()));

  const handleToggle = () => {
    if (!task.done) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 500);
    }
    onToggle();
  };

  return (
    <div className={cn(
      'group flex items-center gap-3 rounded-xl border transition-all',
      compact ? 'p-2.5' : 'p-3.5',
      task.done ? 'bg-glass/20 border-glass/40' : 'bg-glass/60 border-glass/80 shadow-sm hover:shadow-md'
    )}>
      <button
        onClick={handleToggle}
        aria-label={task.done ? 'Geri al' : 'Tamamla'}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          task.done ? 'bg-moss border-moss text-white' : 'border-ink-muted hover:border-moss hover:bg-moss/10',
          popping && 'scale-125'
        )}
      >
        {task.done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-sm leading-snug transition-all', task.done ? 'line-through text-ink-muted' : 'text-ink')}>{task.title}</p>
        {(!compact || subject || task.due) && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {subject && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: subject.color }}>
                {subject.emoji} {subject.name}
              </span>
            )}
            {task.due && (
              <span className={cn('text-[11px] font-bold flex items-center gap-1', overdue ? 'text-clay' : 'text-ink-muted')}>
                <CalendarDays className="w-3 h-3" /> {overdue ? 'Gecikti · ' : ''}{dueLabel(task.due)}
              </span>
            )}
          </div>
        )}
      </div>
      {task.priority > 0 && !task.done && (
        <Flag className={cn('w-4 h-4 shrink-0', task.priority === 2 ? 'text-clay fill-clay' : 'text-sun fill-sun')} aria-label={task.priority === 2 ? 'Yüksek öncelik' : 'Orta öncelik'} />
      )}
      {onDelete && (
        <button onClick={onDelete} aria-label="Sil" className="p-1.5 rounded-lg text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
