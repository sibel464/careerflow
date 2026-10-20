import React, { useState } from 'react';
import { format, parseISO, addDays, isBefore, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, CalendarDays, Flag, BookOpen, Sparkles, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useStudy } from '../../Hooks/useStudy';
import { parseQuickTask, StudyTask } from '../../Utils/study';
import { dueLabel } from '../../Components/Study/TaskRow';
import { DecorPicker } from '../../Components/DecorPicker';
import { cn } from '../../Utils/classNames';

type Filter = 'today' | 'upcoming' | 'all' | 'done';

const FILTERS: { id: Filter; label: string; emoji: string }[] = [
  { id: 'today', label: 'Bugün', emoji: '☀️' },
  { id: 'upcoming', label: 'Yaklaşan', emoji: '📆' },
  { id: 'all', label: 'Tümü', emoji: '📋' },
  { id: 'done', label: 'Tamamlanan', emoji: '✅' },
];

export const Tasks: React.FC = () => {
  const { tasks, setTasks, subjects, subjectById } = useStudy();
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('today');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const parsed = parseQuickTask(input, subjects);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.title) return;
    setTasks(prev => [{
      id: uuidv4(), title: parsed.title, done: false, due: parsed.due ?? (filter === 'today' ? todayKey : undefined),
      priority: parsed.priority, subjectId: parsed.subjectId ?? subjectFilter ?? undefined, createdAt: new Date().toISOString(),
    }, ...prev]);
    setInput('');
  };

  const toggle = (task: StudyTask) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } : t)));
    if (!task.done) {
      toast.success(`+2 🪙 · "${task.title}" tamamlandı!`, { autoClose: 2000 });
    }
  };

  const remove = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const visible = tasks
    .filter(t => !subjectFilter || t.subjectId === subjectFilter)
    .filter(t => {
      if (filter === 'done') return t.done;
      if (t.done) return false;
      if (filter === 'today') return !t.due || t.due <= todayKey;
      if (filter === 'upcoming') return !!t.due && t.due > todayKey;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'done') return (b.completedAt || '').localeCompare(a.completedAt || '');
      return (a.due || '9999').localeCompare(b.due || '9999') || b.priority - a.priority;
    });

  // Group "upcoming" and "all" by day for a planner feel.
  const groups = filter === 'upcoming' || filter === 'all'
    ? Object.entries(visible.reduce<Record<string, StudyTask[]>>((acc, t) => {
        const key = t.due ?? 'none';
        (acc[key] ||= []).push(t);
        return acc;
      }, {}))
    : [['', visible] as [string, StudyTask[]]];

  const counts: Record<Filter, number> = {
    today: tasks.filter(t => !t.done && (!t.due || t.due <= todayKey)).length,
    upcoming: tasks.filter(t => !t.done && t.due && t.due > todayKey).length,
    all: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
  };
  const doneToday = tasks.filter(t => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === todayKey).length;
  const overdue = tasks.filter(t => !t.done && t.due && isBefore(parseISO(t.due), startOfDay(new Date()))).length;

  const tabColors: Record<Filter, string> = { today: '#f2c94c', upcoming: '#8fc1e3', all: '#b6d7a8', done: '#e9a7c0' };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Planlayıcım ✏️</h1>
          <p className="text-ink-soft mt-2">Doğal dille yaz, gerisini defter halletsin. Her tamamlanan görev +2 🪙</p>
        </div>
        <DecorPicker rows={['paper']} />
      </div>

      {/* Subject washi tapes */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1">
        <button onClick={() => setSubjectFilter(null)} className={cn('washi px-4 py-1.5 text-xs font-black text-[#3b2f2a] whitespace-nowrap transition-all', !subjectFilter ? '-translate-y-0.5 shadow-md' : 'opacity-60 hover:opacity-100')} style={tape('#e3d9c6')}>Tüm dersler</button>
        {subjects.map((s, i) => (
          <button key={s.id} onClick={() => setSubjectFilter(subjectFilter === s.id ? null : s.id)}
            className={cn('washi px-4 py-1.5 text-xs font-black text-white whitespace-nowrap transition-all', subjectFilter === s.id ? 'shadow-md' : 'opacity-60 hover:opacity-100')}
            style={{ ...tape(s.color), transform: `rotate(${i % 2 ? 1.5 : -1.5}deg) translateY(${subjectFilter === s.id ? -2 : 0}px)` }}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto pt-9">
        {/* Divider tabs sticking out of the top of the notebook */}
        <div className="absolute top-0 left-14 right-4 flex gap-1.5 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn('px-4 pt-2 pb-4 rounded-t-xl text-sm font-black whitespace-nowrap transition-all text-[#3b2f2a]', filter === f.id ? 'translate-y-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.25)]' : 'translate-y-2 opacity-75 hover:translate-y-1')}
              style={{ background: tabColors[f.id] }}>
              {f.emoji} {f.label} <span className="ml-1 text-[11px] opacity-70">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <div className="relative paper rounded-r-2xl rounded-l-md shadow-[0_24px_40px_-24px_rgba(60,40,20,0.5),0_3px_0_-1px_var(--paper-edge),0_6px_0_-2px_var(--paper-edge)] pl-14 sm:pl-20 pr-4 sm:pr-8 pt-6 pb-14 min-h-[440px]">
          {/* Spiral binding */}
          <div className="absolute -left-2 top-5 bottom-5 flex flex-col justify-between pointer-events-none" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => <span key={i} className="spiral-ring" />)}
          </div>
          <span className="absolute top-0 bottom-0 left-11 sm:left-16 w-px" style={{ background: 'var(--paper-margin)' }} aria-hidden />
          <span className="washi hidden sm:block absolute -top-3 right-10 w-28 h-7 rotate-[4deg]" style={tape(tabColors[filter])} aria-hidden />

          <div className="paper-lines">
            {/* Write a new task right on the paper */}
            <form onSubmit={add} className="h-9 flex items-center gap-2">
              <span className="text-xl" aria-hidden>✏️</span>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder='Yeni görev… "API entegrasyonu yarın !! #react"'
                className="flex-1 min-w-0 bg-transparent outline-none font-hand text-[24px] text-[var(--paper-ink)] placeholder:text-[var(--paper-ink)] placeholder:opacity-40" />
              <button type="submit" disabled={!parsed.title} className="shrink-0 w-8 h-8 rounded-full bg-moss text-white flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-transform" aria-label="Ekle"><Plus className="w-4 h-4" /></button>
            </form>
            <div className="h-9 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              {input.trim() ? <>
                <span className="opacity-60 whitespace-nowrap">Anladığım:</span>
                {parsed.due && <span className="hl-blue px-1.5 whitespace-nowrap flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {dueLabel(parsed.due)}</span>}
                {parsed.priority > 0 && <span className={cn('px-1.5 whitespace-nowrap flex items-center gap-1', parsed.priority === 2 ? 'hl-pink' : 'hl-yellow')}><Flag className="w-3 h-3" /> {parsed.priority === 2 ? 'Acil' : 'Önemli'}</span>}
                {parsed.subjectId && <span className="px-1.5 whitespace-nowrap flex items-center gap-1 text-white rounded-sm" style={{ backgroundColor: subjectById(parsed.subjectId)?.color }}><BookOpen className="w-3 h-3" /> {subjectById(parsed.subjectId)?.name}</span>}
                {!parsed.due && !parsed.priority && !parsed.subjectId && <span className="opacity-50 whitespace-nowrap flex items-center gap-1"><Sparkles className="w-3 h-3" /> sadece başlık</span>}
              </> : (
                <span className="opacity-50 whitespace-nowrap">💡 bugün · yarın · cuma · 3 gün sonra · ! önemli · !! acil · #ders</span>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="text-center">
                <p className="font-hand text-4xl leading-[4.5rem]">{filter === 'done' ? 'Henüz biten görev yok 🌱' : 'Sayfa bomboş, keyfine bak! 🏖️'}</p>
                <p className="font-hand text-2xl leading-9 opacity-60">{filter === 'done' ? 'İlk tik burada parlayacak.' : 'Ya da yukarıya yeni bir görev yaz.'}</p>
              </div>
            ) : groups.map(([key, items]) => (
              <div key={key || 'list'}>
                {key && (
                  <p className="h-9 flex items-end pb-1 font-hand text-[26px] leading-none">
                    <span className="doodle-underline">{key === 'none' ? 'Tarihsiz' : `${dueLabel(key)} · ${format(parseISO(key), 'd MMMM', { locale: tr })}`}</span>
                  </p>
                )}
                {items.map(t => <PlannerLine key={t.id} task={t} subjectColor={subjectById(t.subjectId)?.color} subjectEmoji={subjectById(t.subjectId)?.emoji} onToggle={() => toggle(t)} onDelete={() => remove(t.id)} />)}
              </div>
            ))}

            {filter === 'today' && counts.upcoming > 0 && (
              <button onClick={() => setFilter('upcoming')} className="h-9 font-hand text-[22px] opacity-70 hover:opacity-100 underline decoration-dotted">
                yaklaşan {counts.upcoming} görev var → (yarın: {tasks.filter(t => !t.done && t.due === format(addDays(new Date(), 1), 'yyyy-MM-dd')).length})
              </button>
            )}
          </div>

          {/* Rubber stamps */}
          <div className="absolute right-4 sm:right-8 bottom-3 flex gap-3 pointer-events-none">
            {overdue > 0 && <span className="stamp text-clay rotate-[8deg]">{overdue}<small>gecikti</small></span>}
            <span className="stamp text-moss -rotate-[10deg]">{doneToday}<small>bugün ✓</small></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const tape = (color: string) => ({ '--tape': color } as React.CSSProperties);

/** One task written on a notebook line: drawn box, pen tick, strike-through, highlighter priority. */
const PlannerLine: React.FC<{ task: StudyTask; subjectColor?: string; subjectEmoji?: string; onToggle: () => void; onDelete: () => void }> = ({ task, subjectColor, subjectEmoji, onToggle, onDelete }) => {
  const overdue = !task.done && task.due && isBefore(parseISO(task.due), startOfDay(new Date()));
  return (
    <div className="group h-9 flex items-center gap-3">
      <button onClick={onToggle} aria-label={task.done ? 'Geri al' : 'Tamamla'} className="shrink-0 w-7 h-7 hover:scale-110 transition-transform">
        <svg viewBox="0 0 28 28" className="w-full h-full overflow-visible">
          <path d="M4 5.5 C 10 4.2, 18 4.8, 23.5 5 C 24.2 11, 23.6 18, 23.8 23.4 C 17 24, 10 23.4, 4.6 23.8 C 4 17, 4.6 11, 4 5.5 Z" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" />
          {task.done && <path d="M7 14.5 L12 20 L26 2" fill="none" stroke="var(--color-moss)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="pen-tick" />}
        </svg>
      </button>
      <span className="min-w-0 flex-1 flex items-center">
        <span className={cn('relative truncate font-hand text-[24px] leading-8 px-0.5', !task.done && task.priority === 2 && 'hl-pink', !task.done && task.priority === 1 && 'hl-yellow', task.done && 'opacity-50')}>
          {task.title}
          {task.done && <span className="pen-strike" aria-hidden />}
        </span>
      </span>
      {subjectColor && <span className="shrink-0 washi px-2 py-0.5 text-[11px]" style={{ ...tape(subjectColor), transform: 'rotate(-3deg)' }}>{subjectEmoji}</span>}
      {task.due && <span className={cn('shrink-0 text-[11px] font-bold hidden sm:inline', overdue ? 'text-clay' : 'opacity-50')}>{overdue ? 'gecikti · ' : ''}{dueLabel(task.due)}</span>}
      <button onClick={onDelete} aria-label="Sil" className="shrink-0 p-1 opacity-0 group-hover:opacity-60 focus:opacity-60 hover:text-clay transition-opacity"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
};
