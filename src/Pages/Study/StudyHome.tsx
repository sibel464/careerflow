import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { differenceInCalendarDays, format, parseISO, subDays, isBefore, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowRight, Pencil, Check, MapPin, Plus } from 'lucide-react';
import { useStudy } from '../../Hooks/useStudy';
import { usePersonal } from '../../Hooks/usePersonal';
import { useCorner } from '../../Hooks/useCorner';
import { NOTE_COLORS } from '../../Utils/corner';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { PLANTS_KEY, Plant, seedPlants, thirstOf } from '../../Utils/plants';
import { DEFAULT_WALLET, Tx, WALLET_KEYS, WalletSettings, money, seedTx } from '../../Utils/wallet';
import { endOfMonth } from 'date-fns';
import { useFocus, formatClock } from '../../Hooks/FocusContext';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { useNow } from '../../Hooks/useNow';
import { minutesOn, studyStreak, formatMinutes } from '../../Utils/study';
import { greeting } from '../../Utils/insights';
import { classNow, toMinutes, habitDone } from '../../Utils/personal';
import { TaskRow } from '../../Components/Study/TaskRow';
import { MoodCheckIn } from '../../Components/MoodCheckIn';
import { Companion } from '../../Components/Companion';
import { WeekRecap } from '../../Components/WeekRecap';
import { WeatherWindow } from '../../Components/WeatherWindow';
import { TerminalHero } from '../../Components/Study/TerminalHero';
import { WeatherClothesline } from '../../Components/Weather/WeatherClothesline';
import { FortuneCookie } from '../../Components/FortuneCookie';
import { HabitRing } from './Habits';
import { useHabitActions } from '../../Hooks/useHabitActions';
import { readStored } from '../../Hooks/useLocalStorage';
import { forestProgress, saplingStage, FOREST_WATER_KEY } from '../../Utils/forest';
import { cn } from '../../Utils/classNames';

const QUOTES = [
  'Disiplin, ne istediğini hatırlamaktır.',
  'Bugün yaptıkların, yarının kolaylığıdır.',
  'Mükemmel olmak zorunda değilsin, sadece başlaman lazım.',
  'Küçük adımlar, büyük yolculuklar yaratır.',
  'Zor olan, değerli olandır.',
  'Bir pomodoro daha. Sadece bir tane.',
];

/** Consistent card header used across the dashboard. */
const CardTitle: React.FC<{ title: string; emoji: string; action?: { label: string; onClick: () => void } }> = ({ title, emoji, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[15px] font-black text-ink flex items-center gap-2"><span className="text-lg">{emoji}</span>{title}</h2>
    {action && (
      <button onClick={action.onClick} className="text-xs font-bold text-moss hover:underline flex items-center gap-0.5">{action.label} <ArrowRight className="w-3 h-3" /></button>
    )}
  </div>
);


export const StudyHome: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { subjects, exams, tasks, setTasks, log, settings, setSettings, subjectById, coins } = useStudy();
  const { timetable, habits } = usePersonal();
  const { bump } = useHabitActions();
  const { books, setBooks, notes, capsules } = useCorner();
  const focus = useFocus();
  const { preferences } = usePreferences();
  const now = new Date(useNow(60000));
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [editingWhy, setEditingWhy] = useState(false);
  const recapOpen = params.has('haftam');

  const today = minutesOn(log, new Date());
  const forest = forestProgress(log, readStored<string[]>(FOREST_WATER_KEY, []));
  const journalToday = !!readStored<Record<string, unknown>>('careerflow_journal', {})[format(new Date(), 'yyyy-MM-dd')];
  const streak = studyStreak(log);
  const hello = greeting();
  const schedule = classNow(timetable, now);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const upcomingExams = exams
    .filter(e => !isBefore(parseISO(e.date), startOfDay(new Date())))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const todaysTasks = tasks
    .filter(t => !t.done && t.due && t.due <= todayKey)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
  const habitsDone = habits.filter(h => habitDone(h, todayKey)).length;
  const [walletTx] = useLocalStorage<Tx[]>(WALLET_KEYS.tx, seedTx);
  const [wallet] = useLocalStorage<WalletSettings>(WALLET_KEYS.settings, DEFAULT_WALLET);
  const monthPrefix = todayKey.slice(0, 7);
  const spentMonth = walletTx.filter(t => t.type === 'out' && t.date.startsWith(monthPrefix)).reduce((s, t) => s + t.amount, 0);
  const spendToday = Math.max(wallet.budget - spentMonth, 0) / (differenceInCalendarDays(endOfMonth(new Date()), new Date()) + 1);
  const [plants] = useLocalStorage<Plant[]>(PLANTS_KEY, seedPlants);
  const thirsty = plants.filter(p => thirstOf(p) >= 1).length;
  const readyCapsules = capsules.filter(c => !c.opened && c.openAt <= todayKey);
  const nextCapsule = capsules.filter(c => c.openAt > todayKey).sort((a, b) => a.openAt.localeCompare(b.openAt))[0];
  const readingNow = books.find(b => b.status === 'reading');
  const pinned = [...notes].sort((a, b) => b.z - a.z).slice(0, 3);

  // Last 7 days, stacked by subject.
  const week = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const weekData = week.map(day => ({
    day,
    bySubject: subjects.map(s => ({
      subject: s,
      minutes: log.filter(l => l.subjectId === s.id && format(parseISO(l.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).reduce((a, l) => a + l.minutes, 0),
    })),
    total: minutesOn(log, day),
  }));
  const maxDay = Math.max(...weekData.map(d => d.total), settings.dailyGoal, 1);
  const weekTotal = weekData.reduce((s, d) => s + d.total, 0);

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } : t)));

  const closeRecap = () => { params.delete('haftam'); setParams(params, { replace: true }); };

  return (
    <div className="space-y-6 pb-12">
      {readyCapsules.length > 0 && (
        <button onClick={() => navigate('/study/corner/capsule')} className="w-full capsule-glow rounded-3xl px-6 py-4 flex items-center gap-4 text-left text-white shadow-lg bg-[linear-gradient(120deg,#c2577a,#7a4a8a)] hover:scale-[1.01] transition-transform">
          <span className="text-4xl animate-[float_3s_ease-in-out_infinite]">💌</span>
          <span className="flex-1 min-w-0">
            <span className="block font-black text-lg">Geçmişten bir mektubun var!</span>
            <span className="block text-sm opacity-90 truncate">“{readyCapsules[0].title}” açılmaya hazır{readyCapsules.length > 1 ? ` · +${readyCapsules.length - 1} mektup daha` : ''}</span>
          </span>
          <span className="px-4 py-2 rounded-xl bg-white/20 font-black text-sm flex items-center gap-1.5 shrink-0">Aç <ArrowRight className="w-4 h-4" /></span>
        </button>
      )}

      {/* Row 1 — hero + today's classes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TerminalHero
            hello={hello}
            name={preferences.userName}
            today={today}
            goal={settings.dailyGoal}
            quote={quote}
            streak={streak}
            coins={coins.balance}
            money={money(Math.floor(spendToday))}
            openTasks={tasks.filter(t => !t.done && t.due && t.due <= todayKey).length}
            thirsty={thirsty}
            focusRunning={focus.running}
            focusClock={formatClock(focus.remaining)}
            onFocus={() => (focus.running ? focus.toggle() : navigate('/study/focus'))}
            onWeek={() => setParams({ haftam: '1' })}
            go={navigate}
          />
        </div>

        <div className="glass-panel p-6">
          <CardTitle title="Bugünün programı" emoji="🗓️" action={{ label: 'Haftalık', onClick: () => navigate('/study/subjects/program') }} />
          {schedule.today.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🏖️</p>
              <p className="text-sm font-bold text-ink-soft">Bugün ders yok.</p>
              <button onClick={() => navigate('/study/subjects/program')} className="mt-2 text-xs font-bold text-moss hover:underline">Program ekle →</button>
            </div>
          ) : (
            <ol className="relative space-y-2.5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-sand/60">
              {schedule.today.map(s => {
                const past = toMinutes(s.end) <= schedule.minutes;
                const live = schedule.current?.id === s.id;
                return (
                  <li key={s.id} className={cn('relative pl-7', past && 'opacity-45')}>
                    <span className={cn('absolute left-0 top-2 w-4 h-4 rounded-full border-[3px] border-cream', live && 'animate-pulse')} style={{ background: s.color }} />
                    <div className={cn('rounded-xl px-3 py-2 transition-colors', live ? 'bg-moss/10 ring-1 ring-moss/30' : 'hover:bg-glass/50')}>
                      <p className="text-sm font-bold text-ink flex items-center gap-2">{s.title}{live && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-moss text-white">ŞİMDİ</span>}</p>
                      <p className="text-xs font-semibold text-ink-muted flex items-center gap-2">{s.start}–{s.end}{s.room && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{s.room}</span>}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* Window on the real weather + today's fortune */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-stretch">
        <WeatherWindow />
        <FortuneCookie />
      </div>
      <WeatherClothesline />

      {/* Row 2 — habits, tasks, exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <CardTitle title={`Alışkanlıklar · ${habitsDone}/${habits.length}`} emoji="💧" action={{ label: 'Tümü', onClick: () => navigate('/study/habits') }} />
          <div className="grid grid-cols-2 gap-3">
            {habits.slice(0, 4).map(h => {
              const v = h.log[todayKey] ?? 0;
              return (
                <button key={h.id} onClick={() => bump(h, 1)} title={`${h.name}: ${v}/${h.target} — dokun, +1`}
                  className="flex items-center gap-2.5 p-2 rounded-2xl bg-glass/40 hover:bg-glass/70 border border-glass/60 text-left transition-colors">
                  <HabitRing habit={h} value={v} size={48} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink truncate">{h.name}</span>
                    <span className="block text-[11px] font-bold text-ink-muted">{v}/{h.target} {h.unit}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-6">
          <CardTitle title="Bugün yapılacaklar" emoji="✅" action={{ label: 'Tümü', onClick: () => navigate('/study/tasks') }} />
          {todaysTasks.length ? (
            <div className="space-y-2">
              {todaysTasks.map(t => <TaskRow key={t.id} task={t} subject={subjectById(t.subjectId)} onToggle={() => toggleTask(t.id)} compact />)}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-sm font-bold text-ink-soft">Bugün için her şey tamam!</p>
              <button onClick={() => navigate('/study/tasks')} className="mt-2 text-xs font-bold text-moss hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Görev ekle</button>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 md:col-span-2 xl:col-span-1">
          <CardTitle title="Yaklaşan sınavlar" emoji="🎯" action={{ label: 'Dersler', onClick: () => navigate('/study/subjects') }} />
          {upcomingExams.length ? (
            <div className="space-y-2.5">
              {upcomingExams.map(exam => {
                const subject = subjectById(exam.subjectId);
                const days = differenceInCalendarDays(parseISO(exam.date), new Date());
                const urgent = days <= 3;
                return (
                  <div key={exam.id} className="flex items-center gap-3 p-3 rounded-2xl bg-glass/40 border border-glass/60">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `color-mix(in srgb, ${subject?.color ?? '#888'} 18%, transparent)` }}>{subject?.emoji ?? '📝'}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-ink truncate">{exam.title}</span>
                      <span className="block text-[11px] font-semibold text-ink-muted">{format(parseISO(exam.date), 'd MMM EEEE', { locale: tr })}</span>
                    </span>
                    <span className={cn('text-center px-2.5 py-1 rounded-lg shrink-0', urgent ? 'bg-clay/15 text-clay' : 'bg-moss/10 text-moss')}>
                      <span className="block text-lg font-black leading-none">{days || '!'}</span>
                      <span className="block text-[9px] font-black uppercase">{days ? 'gün' : 'bugün'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm font-bold text-ink-muted text-center py-6">Yakında sınav yok 🌤️</p>}
        </div>
      </div>

      {/* Row 3 — week chart + wellbeing */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel p-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <CardTitle title="Bu hafta" emoji="📊" />
              <p className="text-xs font-semibold text-ink-muted -mt-3">Toplam {formatMinutes(weekTotal)} · günlük ort. {formatMinutes(Math.round(weekTotal / 7))}</p>
            </div>
            <span className="text-[11px] font-bold text-ink-muted flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-clay" /> Günlük hedef</span>
          </div>
          <div className="relative h-40 flex items-end gap-2 sm:gap-4">
            <div className="absolute inset-x-0 border-t-2 border-dashed border-clay/50 pointer-events-none" style={{ bottom: `${(settings.dailyGoal / maxDay) * 100}%` }} />
            {weekData.map(d => (
              <div key={d.day.toISOString()} className="flex-1 h-full flex items-end justify-center">
                <div className="w-full max-w-11 flex flex-col-reverse rounded-t-lg overflow-hidden" style={{ height: `${(d.total / maxDay) * 100}%` }} title={`${format(d.day, 'd MMM', { locale: tr })}: ${formatMinutes(d.total)}`}>
                  {d.bySubject.filter(b => b.minutes > 0).map(b => (
                    <div key={b.subject.id} className="w-full border-t-2 border-cream first:border-t-0" style={{ height: `${(b.minutes / Math.max(d.total, 1)) * 100}%`, backgroundColor: b.subject.color }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 sm:gap-4 mt-2">
            {weekData.map(d => (
              <span key={d.day.toISOString()} className={cn('flex-1 text-center text-[11px] font-black', format(d.day, 'yyyy-MM-dd') === todayKey ? 'text-moss' : 'text-ink-muted')}>
                {format(d.day, 'EEEEEE', { locale: tr })}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {subjects.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 text-xs font-bold text-ink-soft"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />{s.name}</span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <MoodCheckIn />
          <div className="grid grid-cols-2 gap-6">
            <button onClick={() => navigate('/study/journal')} className="glass-panel glass-panel-hover p-5 text-left relative overflow-hidden">
              <span className="absolute -right-3 -bottom-4 text-6xl opacity-15 rotate-12">📔</span>
              <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Günlük</p>
              <p className="font-hand text-2xl text-clay mt-1 leading-tight">{journalToday ? 'Sayfan hazır ✓' : 'Bugün neler oldu?'}</p>
            </button>
            <button onClick={() => navigate('/study/forest')} className="glass-panel glass-panel-hover p-5 text-left relative overflow-hidden">
              <span className="absolute -right-3 -bottom-4 text-6xl opacity-15 rotate-12">🌲</span>
              <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Orman</p>
              <p className="text-xl font-black text-ink mt-1">{forest.trees.length} ağaç {saplingStage(forest.fraction).emoji}</p>
              <div className="h-1.5 rounded-full bg-sand/50 overflow-hidden mt-2"><div className="h-full bg-moss rounded-full" style={{ width: `${forest.fraction * 100}%` }} /></div>
            </button>
          </div>
        </div>
      </div>

      {/* Row 4 — my corner: book, board, capsule */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <CardTitle title="Şu an okuyorum" emoji="📚" action={{ label: 'Kitaplık', onClick: () => navigate('/study/corner') }} />
          {readingNow ? (
            <div className="flex gap-4 items-center">
              <div className="w-14 h-20 rounded-r-md rounded-l-sm shadow-[3px_5px_10px_rgba(0,0,0,0.25)] p-1.5 flex items-end text-white text-[9px] font-serif font-bold leading-tight shrink-0"
                style={{ background: `linear-gradient(135deg, ${readingNow.color}, color-mix(in srgb, ${readingNow.color} 60%, black))` }}>{readingNow.title}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate">{readingNow.title}</p>
                <p className="text-xs text-ink-muted truncate">{readingNow.author}</p>
                <div className="h-2 rounded-full bg-sand/50 mt-2 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(readingNow.read / readingNow.pages, 1) * 100}%`, background: readingNow.color }} /></div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-bold text-ink-soft tabular-nums">{readingNow.read}/{readingNow.pages}</span>
                  <button onClick={() => setBooks(prev => prev.map(b => (b.id === readingNow.id ? { ...b, read: Math.min(b.pages, b.read + 10) } : b)))} className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-glass/70 text-ink-soft hover:text-ink">+10 sayfa</button>
                </div>
              </div>
            </div>
          ) : <p className="text-sm font-bold text-ink-muted text-center py-6">Raftan bir kitap seç 📖</p>}
        </div>

        <button onClick={() => navigate('/study/corner/board')} className="glass-panel glass-panel-hover p-6 text-left">
          <CardTitle title="Panodan" emoji="📌" />
          <div className="relative h-24">
            {pinned.length === 0 && <p className="text-sm font-bold text-ink-muted text-center pt-6">Panoya ilk notunu as ✏️</p>}
            {pinned.map((n, i) => (
              <span key={n.id} className="absolute top-0 w-[36%] h-24 p-2.5 font-hand text-base leading-5 text-[#3b2f2a] overflow-hidden shadow-md"
                style={{ left: `${i * 32}%`, background: NOTE_COLORS[n.color].bg, transform: `rotate(${[-4, 2, -1][i]}deg)`, zIndex: 3 - i }}>
                {n.text}
              </span>
            ))}
          </div>
        </button>

        <button onClick={() => navigate('/study/corner/capsule')} className="glass-panel glass-panel-hover p-6 text-left relative overflow-hidden md:col-span-2 xl:col-span-1">
          <span className="absolute -right-4 -bottom-6 text-8xl opacity-10 rotate-12">⏳</span>
          <CardTitle title="Zaman kapsülü" emoji="💌" />
          {nextCapsule ? (
            <>
              <p className="text-4xl font-black text-ink tabular-nums">{differenceInCalendarDays(parseISO(nextCapsule.openAt), new Date())} <span className="text-base text-ink-muted">gün</span></p>
              <p className="text-sm font-semibold text-ink-soft mt-1 truncate">“{nextCapsule.title}” açılana kadar</p>
            </>
          ) : <p className="font-hand text-2xl text-clay">Gelecekteki sana bir mektup yaz…</p>}
        </button>
      </div>

      {/* Why I study */}
      <div className="glass-panel px-6 py-5 flex items-center gap-4">
        <span className="text-3xl shrink-0">💫</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Neden çalışıyorum?</p>
          {editingWhy ? (
            <input autoFocus defaultValue={settings.why} onBlur={(e) => { setSettings(s => ({ ...s, why: e.target.value })); setEditingWhy(false); }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-ink font-serif text-lg" />
          ) : (
            <p className="font-serif text-lg text-ink truncate">“{settings.why}”</p>
          )}
        </div>
        <button onClick={() => setEditingWhy(e => !e)} className="p-2 rounded-lg text-ink-muted hover:text-moss hover:bg-glass/60" aria-label="Düzenle">
          {editingWhy ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>
      </div>

      <Companion />

      {recapOpen && <WeekRecap onClose={closeRecap} />}
    </div>
  );
};
