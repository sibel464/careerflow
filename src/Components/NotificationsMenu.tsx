import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, CheckSquare, Calendar, GraduationCap, AlarmClock, LucideIcon } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isBefore, startOfDay } from 'date-fns';
import { useApplications } from '../Hooks/ApplicationContext';
import { useEditor } from '../Hooks/EditorContext';
import { useSpace } from '../Hooks/useSpace';
import { useStudy } from '../Hooks/useStudy';
import { needsFollowUp, pendingTodos, daysSince } from '../Utils/insights';
import { cn } from '../Utils/classNames';

interface Notice {
  id: string;
  icon: LucideIcon;
  tone: string;
  title: string;
  subtitle: string;
  onOpen: () => void;
  /** When set, the icon becomes a "done" button. */
  onComplete?: () => void;
}

/** Each space only shows what matters in that space. */
export const NotificationsMenu: React.FC = () => {
  const space = useSpace();
  const navigate = useNavigate();
  const { applications, toggleTodo } = useApplications();
  const { exams, tasks, setTasks, subjectById } = useStudy();
  const { openEditor } = useEditor();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (fn: () => void) => () => { setOpen(false); fn(); };

  const careerNotices = (): Notice[] => [
    ...applications.filter(app => app.status === 'Mülakat Bekleniyor').map(app => ({
      id: `i-${app.id}`, icon: Calendar, tone: 'bg-amber-400/15 text-amber-600 dark:text-amber-300',
      title: `${app.companyName} mülakatı bekleniyor`, subtitle: 'Soru bankasına göz atmayı unutma 🎙️',
      onOpen: go(() => openEditor(app)),
    })),
    ...needsFollowUp(applications).map(app => ({
      id: `f-${app.id}`, icon: Mail, tone: 'bg-clay/15 text-clay',
      title: `${app.companyName} için takip zamanı`, subtitle: `${daysSince(app.updatedAt)} gündür ses yok — kibar bir e-posta at ✉️`,
      onOpen: go(() => openEditor(app)),
    })),
    ...pendingTodos(applications).map(todo => ({
      id: `t-${todo.id}`, icon: CheckSquare, tone: 'bg-moss/15 text-moss',
      title: todo.text, subtitle: todo.companyName,
      onOpen: go(() => { const app = applications.find(a => a.id === todo.appId); if (app) openEditor(app); }),
      onComplete: () => toggleTodo(todo.appId, todo.id),
    })),
  ];

  const studyNotices = (): Notice[] => {
    const today = startOfDay(new Date());
    const todayKey = new Date().toISOString().slice(0, 10);
    return [
      ...exams
        .filter(e => { const d = differenceInCalendarDays(parseISO(e.date), today); return d >= 0 && d <= 3; })
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(e => {
          const days = differenceInCalendarDays(parseISO(e.date), today);
          const s = subjectById(e.subjectId);
          return {
            id: `e-${e.id}`, icon: GraduationCap, tone: 'bg-clay/15 text-clay',
            title: `${s?.emoji ?? '📝'} ${e.title} ${days === 0 ? 'bugün!' : `${days} gün sonra`}`,
            subtitle: days <= 1 ? 'Son tekrar zamanı, sen hazırsın 💪' : 'Bir pomodoro ile tekrar yapmaya ne dersin? 🍅',
            onOpen: go(() => navigate('/study/subjects')),
          };
        }),
      ...tasks
        .filter(t => !t.done && t.due && t.due <= todayKey)
        .sort((a, b) => b.priority - a.priority)
        .map(t => {
          const overdue = isBefore(parseISO(t.due!), today);
          return {
            id: `st-${t.id}`, icon: overdue ? AlarmClock : CheckSquare, tone: overdue ? 'bg-clay/15 text-clay' : 'bg-moss/15 text-moss',
            title: t.title, subtitle: `${overdue ? 'Gecikti' : 'Bugün'}${subjectById(t.subjectId) ? ` · ${subjectById(t.subjectId)!.name}` : ''}`,
            onOpen: go(() => navigate('/study/tasks')),
            onComplete: () => setTasks(prev => prev.map(x => (x.id === t.id ? { ...x, done: true, completedAt: new Date().toISOString() } : x))),
          };
        }),
    ];
  };

  const notices = space === 'career' ? careerNotices() : studyNotices();
  const count = notices.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Bildirimler (${count})`}
        aria-expanded={open}
        className="p-3 text-ink-soft hover:text-moss rounded-xl hover:bg-glass/50 transition-all relative group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-clay text-white text-[10px] font-black border-2 border-cream rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-glass/60 bg-cream/95 shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 overflow-hidden animate-pop">
          <div className="px-5 py-4 border-b border-glass/60">
            <h3 className="font-bold text-ink">Bildirimler 🔔</h3>
            <p className="text-xs font-semibold text-ink-muted">
              {space === 'career' ? 'Kariyer alanı' : 'Çalışma alanı'} · {count ? `${count} şey ilgini bekliyor` : 'her şey yolunda'}
            </p>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
            {count === 0 && (
              <p className="text-sm font-bold text-ink-muted text-center py-8">
                {space === 'career' ? 'Hepsi tamam, bir kahve molası hak ettin! ☕' : 'Bugün için her şey yolunda. Harikasın! 🌟'}
              </p>
            )}
            {notices.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-glass/60 transition-colors">
                {n.onComplete ? (
                  <button onClick={n.onComplete} aria-label="Tamamla" className={cn('p-2 rounded-lg transition-colors hover:bg-moss hover:text-white', n.tone)}>
                    <n.icon className="w-4 h-4" />
                  </button>
                ) : (
                  <span className={cn('p-2 rounded-lg', n.tone)}><n.icon className="w-4 h-4" /></span>
                )}
                <button onClick={n.onOpen} className="min-w-0 text-left flex-1">
                  <span className="block text-sm font-bold text-ink">{n.title}</span>
                  <span className="block text-xs font-semibold text-ink-muted">{n.subtitle}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
