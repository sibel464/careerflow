import React, { useState } from 'react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MapPin, Plus, Star, CheckSquare, GripVertical } from 'lucide-react';
import { Application, ApplicationStatus } from '../Interfaces';
import { useApplications } from '../Hooks/ApplicationContext';
import { useEditor } from '../Hooks/EditorContext';
import { STATUS_OPTIONS, STATUS_COLORS, STATUS_EMOJI } from '../Utils/constants';
import { CompanyAvatar } from './CompanyAvatar';
import { cn } from '../Utils/classNames';

export const KanbanBoard: React.FC<{ applications: Application[] }> = ({ applications }) => {
  const { updateApplication } = useApplications();
  const { openEditor } = useEditor();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ApplicationStatus | null>(null);

  const handleDrop = (status: ApplicationStatus) => {
    const app = applications.find(a => a.id === draggingId);
    if (app && app.status !== status) updateApplication(app.id, { status });
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <div className="flex gap-5 xl:gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
      {STATUS_OPTIONS.map(status => {
        const items = applications.filter(app => app.status === status);
        const isOver = overColumn === status && draggingId !== null;

        return (
          <section
            key={status}
            onDragOver={(e) => { e.preventDefault(); setOverColumn(status); }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null);
            }}
            onDrop={() => handleDrop(status)}
            className={cn(
              'glass-panel shrink-0 w-[280px] sm:w-[290px] xl:flex-1 xl:w-auto xl:min-w-[180px] flex flex-col max-h-[calc(100vh-20rem)] min-h-[320px] snap-start p-0 overflow-hidden',
              isOver && 'ring-2 ring-moss/50 bg-glass/60 scale-[1.01]'
            )}
          >
            <header className="flex items-center justify-between px-4 py-3.5 border-b border-glass/50 bg-glass/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                <h3 className="font-bold text-sm text-ink leading-tight">
                  <span className="xl:hidden 2xl:inline">{STATUS_EMOJI[status]} </span>{status}
                </h3>
                <span className="text-xs font-black text-ink-muted bg-glass/60 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <button
                onClick={() => openEditor(null, status)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-moss hover:bg-glass/60 transition-colors"
                aria-label={`${status} sütununa başvuru ekle`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {items.length === 0 && (
                <div className={cn(
                  'h-24 rounded-2xl border-2 border-dashed flex items-center justify-center text-xs font-bold text-center px-4 transition-colors',
                  isOver ? 'border-moss/50 text-moss' : 'border-sand/70 text-ink-muted'
                )}>
                  {isOver ? 'Buraya bırak 🌱' : 'Kartları buraya sürükle'}
                </div>
              )}

              {items.map(app => {
                const todos = app.todos || [];
                const done = todos.filter(t => t.completed).length;
                return (
                  <article
                    key={app.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggingId(app.id); }}
                    onDragEnd={() => { setDraggingId(null); setOverColumn(null); }}
                    onClick={() => openEditor(app)}
                    className={cn(
                      'group bg-glass/70 border border-glass/80 rounded-2xl p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all',
                      draggingId === app.id && 'opacity-40 rotate-2'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <CompanyAvatar name={app.companyName} className="h-10 w-10 text-sm rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink text-sm truncate group-hover:text-clay transition-colors">{app.companyName}</p>
                        <p className="text-xs font-semibold text-ink-soft truncate">{app.position}</p>
                      </div>
                      <GripVertical className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[11px] font-bold text-ink-muted">
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{app.city}</span>
                      <span>{formatDistanceToNowStrict(parseISO(app.applicationDate), { locale: tr, addSuffix: true })}</span>
                      {!!app.companyRating && (
                        <span className="flex items-center text-sun">{app.companyRating}<Star className="w-3 h-3 ml-0.5 fill-current" /></span>
                      )}
                    </div>

                    {todos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-ink-soft mb-1">
                          <span className="flex items-center"><CheckSquare className="w-3 h-3 mr-1" />Görevler</span>
                          <span>{done}/{todos.length}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-sand/50 overflow-hidden">
                          <div className="h-full bg-moss rounded-full transition-all" style={{ width: `${(done / todos.length) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
