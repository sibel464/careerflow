import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, isWeekend, parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, BookHeart, ArrowRight, Palette, ImagePlus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStudy } from '../../Hooks/useStudy';
import { usePersonal } from '../../Hooks/usePersonal';
import { useCorner } from '../../Hooks/useCorner';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { useMedia } from '../../Hooks/useMedia';
import { MOOD_KEY, MoodEntry, MOODS } from '../../Utils/mood';
import { formatMinutes } from '../../Utils/study';
import { habitDone, todayIndex, toMinutes } from '../../Utils/personal';
import { compressImage, deleteMedia, saveMedia } from '../../Utils/mediaStore';
import { SeasonArt } from '../../Components/Study/SeasonArt';
import { DecorRows } from '../../Components/DecorPicker';
import { cn } from '../../Utils/classNames';

interface JournalLite { date: string; title: string; body: string; mood: string }

type Highlighter = 'yellow' | 'pink' | 'green' | 'blue';
interface CalendarPrefs {
  weekStartsOn: 0 | 1;
  highlighter: Highlighter;
  show: { focus: boolean; tasks: boolean; classes: boolean; moods: boolean };
  /** Months (yyyy-MM) that have your own photo on top. */
  covers: string[];
}

const CAL_KEY = 'careerflow_calendar_prefs';
const DEFAULT_PREFS: CalendarPrefs = { weekStartsOn: 1, highlighter: 'yellow', show: { focus: true, tasks: true, classes: true, moods: true }, covers: [] };
const HIGHLIGHTERS: Record<Highlighter, { name: string; color: string }> = {
  yellow: { name: 'Sarı', color: '#ffe970' },
  pink: { name: 'Pembe', color: '#ffb3d1' },
  green: { name: 'Yeşil', color: '#b6f0a8' },
  blue: { name: 'Mavi', color: '#a9dcff' },
};
const SHOW_LABELS: Record<keyof CalendarPrefs['show'], string> = { focus: '🍅 Odak süresi', tasks: '✅ Görevler', classes: '📖 Ders noktaları', moods: '😊 Ruh hali' };
const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const RED = '#c0392b';

const key = (d: Date) => format(d, 'yyyy-MM-dd');
const coverId = (month: Date) => `calendar-cover-${format(month, 'yyyy-MM')}`;

/** The picture at the top: your own photo for this month, or the season's drawing. */
const Cover: React.FC<{ month: Date; hasPhoto: boolean }> = ({ month, hasPhoto }) => {
  const src = useMedia(hasPhoto ? coverId(month) : 'none');
  return hasPhoto && src
    ? <img src={src} alt="" className="w-full h-full object-cover" />
    : <SeasonArt month={month.getMonth()} />;
};

export const StudyCalendar: React.FC = () => {
  const { exams, tasks, setTasks, log, subjects, subjectById, settings } = useStudy();
  const { timetable, habits } = usePersonal();
  const { capsules, books } = useCorner();
  const [journal] = useLocalStorage<Record<string, JournalLite>>('careerflow_journal', {});
  const [moods] = useLocalStorage<MoodEntry[]>(MOOD_KEY, []);
  const [stored, setPrefs] = useLocalStorage<CalendarPrefs>(CAL_KEY, DEFAULT_PREFS);
  const prefs = { ...DEFAULT_PREFS, ...stored, show: { ...DEFAULT_PREFS.show, ...stored.show } };
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => key(new Date()));
  const [quick, setQuick] = useState('');
  const [customizing, setCustomizing] = useState(false);
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const weekOpts = { weekStartsOn: prefs.weekStartsOn };
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), weekOpts), end: endOfWeek(endOfMonth(month), weekOpts) });
  const weekdays = prefs.weekStartsOn === 1 ? WEEKDAYS : [WEEKDAYS[6], ...WEEKDAYS.slice(0, 6)];
  const highlight = HIGHLIGHTERS[prefs.highlighter].color;
  const hasPhoto = prefs.covers.includes(format(month, 'yyyy-MM'));

  // Everything indexed by day once, so cells stay cheap.
  const byDay = useMemo(() => {
    const minutes: Record<string, number> = {};
    log.forEach(l => { const k = l.date.slice(0, 10); minutes[k] = (minutes[k] ?? 0) + l.minutes; });
    const group = <T,>(items: T[], k: (t: T) => string | undefined) => {
      const m: Record<string, T[]> = {};
      items.forEach(t => { const d = k(t); if (d) (m[d] ??= []).push(t); });
      return m;
    };
    return {
      minutes,
      exams: group(exams, e => e.date.slice(0, 10)),
      tasks: group(tasks, t => t.due),
      capsules: group(capsules, c => c.openAt),
      books: group(books, b => b.finishedAt),
      moods: Object.fromEntries(moods.map(m => [m.date, m])),
    };
  }, [log, exams, tasks, capsules, books, moods]);

  const sel = parseISO(selected);
  const selClasses = timetable.filter(s => s.day === todayIndex(sel)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const selMood = byDay.moods[selected];
  const selJournal = journal[selected];
  const selHabits = habits.filter(h => habitDone(h, selected));
  const monthMinutes = days.filter(d => isSameMonth(d, month)).reduce((s, d) => s + (byDay.minutes[key(d)] ?? 0), 0);
  const monthExams = exams.filter(e => isSameMonth(parseISO(e.date), month)).length;

  const turn = (dir: 'next' | 'prev') => {
    setFlip(dir);
    setMonth(m => (dir === 'next' ? addMonths(m, 1) : subMonths(m, 1)));
    window.setTimeout(() => setFlip(null), 450);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quick.trim()) return;
    setTasks(prev => [...prev, { id: uuidv4(), title: quick.trim(), done: false, due: selected, priority: 0, createdAt: new Date().toISOString() }]);
    setQuick('');
  };

  const uploadCover = async (file?: File) => {
    if (!file) return;
    await saveMedia(coverId(month), await compressImage(file, 1200));
    const m = format(month, 'yyyy-MM');
    setPrefs(p => ({ ...p, covers: [...new Set([...(p.covers ?? []), m])] }));
  };
  const removeCover = async () => {
    await deleteMedia(coverId(month)).catch(() => undefined);
    const m = format(month, 'yyyy-MM');
    setPrefs(p => ({ ...p, covers: (p.covers ?? []).filter(x => x !== m) }));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Takvim 🗓️</h1>
          <p className="text-ink-soft mt-2">Bu ay {formatMinutes(monthMinutes)} odak · {monthExams} sınav. Dersler, görevler, günlük ve ruh halin tek takvimde.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => turn('prev')} className="btn-ghost p-2.5" aria-label="Önceki ay"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => { setMonth(startOfMonth(new Date())); setSelected(key(new Date())); }} className="btn-ghost px-4 py-2 text-sm font-bold">Bugün</button>
          <button onClick={() => turn('next')} className="btn-ghost p-2.5" aria-label="Sonraki ay"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => setCustomizing(c => !c)} className={cn('btn-ghost px-4 py-2 text-sm font-bold', customizing && 'ring-2 ring-moss/50')}>
            <Palette className="w-4 h-4 mr-1.5" /> Özelleştir
          </button>
        </div>
      </div>

      {customizing && (
        <div className="glass-panel p-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4 animate-fade-in relative">
          <button onClick={() => setCustomizing(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-glass/60 text-ink-soft" aria-label="Kapat"><X className="w-4 h-4" /></button>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Kapak fotoğrafı</p>
            <p className="text-xs text-ink-soft mb-2.5">{format(month, 'MMMM', { locale: tr })} ayının üstüne kendi fotoğrafını koy. Koymazsan mevsim çizimi görünür.</p>
            <div className="flex gap-2">
              <button onClick={() => fileInput.current?.click()} className="btn-primary px-3 py-2 text-xs"><ImagePlus className="w-4 h-4 mr-1.5" /> Fotoğraf seç</button>
              {hasPhoto && <button onClick={removeCover} className="btn-ghost px-3 py-2 text-xs"><Trash2 className="w-4 h-4 mr-1" /> Kaldır</button>}
            </div>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={e => { uploadCover(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Fosforlu kalem</p>
            <div className="flex gap-2">
              {(Object.keys(HIGHLIGHTERS) as Highlighter[]).map(h => (
                <button key={h} onClick={() => setPrefs(p => ({ ...p, highlighter: h }))} title={HIGHLIGHTERS[h].name} aria-label={HIGHLIGHTERS[h].name}
                  className={cn('w-9 h-9 rounded-xl border-2 border-black/10 transition-transform', prefs.highlighter === h && 'ring-2 ring-moss ring-offset-2 ring-offset-cream scale-110')}
                  style={{ background: HIGHLIGHTERS[h].color }} />
              ))}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mt-4 mb-2">Hafta başlangıcı</p>
            <div className="flex gap-2">
              {([[1, 'Pazartesi'], [0, 'Pazar']] as const).map(([v, label]) => (
                <button key={v} onClick={() => setPrefs(p => ({ ...p, weekStartsOn: v }))} className={cn('px-3 py-1.5 rounded-xl text-xs font-bold', prefs.weekStartsOn === v ? 'bg-moss text-white' : 'bg-glass/60 text-ink-soft')}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Takvimde göster</p>
            <div className="space-y-1.5">
              {(Object.keys(SHOW_LABELS) as (keyof CalendarPrefs['show'])[]).map(k => (
                <label key={k} className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
                  <input type="checkbox" checked={prefs.show[k]} onChange={() => setPrefs(p => ({ ...p, show: { ...prefs.show, [k]: !prefs.show[k] } }))} className="w-4 h-4 accent-[var(--color-moss)]" />
                  {SHOW_LABELS[k]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <DecorRows rows={['paper']} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        {/* 📌 The wall calendar, hanging from a nail */}
        <div className="relative pt-10">
          <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-14 pointer-events-none z-10" viewBox="0 0 224 56" aria-hidden>
            <path d="M112 8 L 30 50 M112 8 L 194 50" stroke="#8a7a66" strokeWidth="1.4" fill="none" />
            <circle cx="112" cy="8" r="5.5" fill="#9aa1a9" /><circle cx="110.5" cy="6.5" r="2" fill="#e6e9ec" />
          </svg>
          {/* Pages underneath */}
          <div className="absolute inset-x-3 top-12 bottom-[-6px] paper rounded-sm rotate-[1.2deg] shadow-md" aria-hidden />
          <div className="absolute inset-x-1 top-11 bottom-[-3px] paper rounded-sm rotate-[-0.8deg] shadow" aria-hidden />

          <div key={format(month, 'yyyy-MM')} className={cn('relative paper rounded-sm shadow-[0_2px_3px_rgba(0,0,0,0.08),0_26px_44px_-24px_rgba(60,40,20,0.5)] rotate-[-0.25deg]',
            flip === 'next' && 'cal-flip-next', flip === 'prev' && 'cal-flip-prev')}>
            {/* Spiral binding */}
            <div className="absolute -top-3 inset-x-6 flex justify-between pointer-events-none z-10" aria-hidden>
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} className="relative w-3 h-7">
                  <span className="absolute left-0.5 bottom-0.5 w-2 h-2 rounded-full bg-black/45" />
                  <span className="absolute inset-x-0 top-0 h-5 rounded-full border-[2.5px] border-[#8d939b] border-b-transparent shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
                </span>
              ))}
            </div>

            {/* Picture */}
            <div className="p-3 sm:p-4 pb-0">
              <div className="relative h-36 sm:h-48 overflow-hidden rounded-[2px] shadow-inner">
                <Cover month={month} hasPhoto={hasPhoto} />
                <span className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" />
              </div>
            </div>

            {/* Month title, printed */}
            <div className="flex items-end justify-between px-4 sm:px-6 pt-3 pb-2">
              <p className="font-serif font-bold text-3xl sm:text-4xl uppercase tracking-[0.18em]">{format(month, 'MMMM', { locale: tr })}</p>
              <p className="font-serif text-2xl sm:text-3xl opacity-50 tracking-widest">{format(month, 'yyyy')}</p>
            </div>

            {/* The grid */}
            <div className="px-2 sm:px-4 pb-4">
              <div className="grid grid-cols-7 border-t-2 border-current/60">
                {weekdays.map(d => (
                  <div key={d} className={cn('text-center text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] py-1.5', (d === 'Cmt' || d === 'Paz') ? 'text-[#b0523a]' : 'opacity-60')}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 border-l border-t border-current/15">
                {days.map(d => {
                  const k = key(d);
                  const inMonth = isSameMonth(d, month);
                  const mins = byDay.minutes[k] ?? 0;
                  const dayExams = byDay.exams[k] ?? [];
                  const dayTasks = prefs.show.tasks ? byDay.tasks[k] ?? [] : [];
                  const mood = prefs.show.moods ? byDay.moods[k] : undefined;
                  const classes = prefs.show.classes ? timetable.filter(s => s.day === todayIndex(d)) : [];
                  const shownExams = dayExams.slice(0, 1);
                  const shownTasks = dayTasks.slice(0, dayExams.length ? 1 : 2);
                  const more = dayExams.length + dayTasks.length - shownExams.length - shownTasks.length;
                  const isSel = selected === k;
                  return (
                    <button key={k} onClick={() => setSelected(k)}
                      className={cn('relative text-left border-r border-b border-current/15 p-1 sm:p-1.5 min-h-[62px] sm:min-h-[96px] flex flex-col gap-0.5 transition-colors hover:bg-black/[0.03]',
                        !inMonth && 'opacity-35')}>
                      {/* Highlighter swipe on the chosen day */}
                      {isSel && <span className="absolute left-1 right-1 top-1.5 h-6 sm:h-7 -rotate-2 rounded-sm mix-blend-multiply opacity-80" style={{ background: highlight }} aria-hidden />}
                      <div className="relative flex items-start justify-between">
                        <span className={cn('relative w-7 h-7 flex items-center justify-center font-serif font-bold text-sm sm:text-base', isWeekend(d) && 'text-[#b0523a]')}>
                          {format(d, 'd')}
                          {isToday(d) && (
                            <svg viewBox="0 0 40 40" className="absolute -inset-1.5 w-10 h-10 pointer-events-none" aria-hidden>
                              <path d="M21 4 C 33 4, 37 14, 36 21 C 35 31, 27 36, 19 36 C 9 35, 4 28, 5 19 C 6 11, 13 5, 24 6" fill="none" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                          )}
                        </span>
                        {mood && <span className="text-sm sm:text-base leading-none drop-shadow-sm">{MOODS.find(m => m.value === mood.mood)?.emoji}</span>}
                      </div>
                      <div className="relative hidden sm:flex flex-col gap-0.5 min-w-0">
                        {shownExams.map(e => (
                          <span key={e.id} className="truncate rounded-[3px] px-1.5 py-0.5 text-[10px] font-black text-white -rotate-1 shadow-[0_1px_2px_rgba(0,0,0,0.25)]" style={{ background: subjectById(e.subjectId)?.color ?? RED }}>🎯 {e.title}</span>
                        ))}
                        {shownTasks.map(t => (
                          <span key={t.id} className={cn('truncate font-hand text-[15px] leading-[1.05]', t.done && 'line-through opacity-50')} style={{ color: subjectById(t.subjectId)?.color ?? '#2c3e70' }}>
                            {t.title}
                          </span>
                        ))}
                        {more > 0 && <span className="font-hand text-sm opacity-60">+{more} daha</span>}
                      </div>
                      <div className="relative mt-auto flex items-center gap-0.5 flex-wrap">
                        {inMonth && classes.slice(0, 4).map(c => <span key={c.id} className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />)}
                        {dayExams.length > 0 && <span className="sm:hidden w-1.5 h-1.5 rounded-full" style={{ background: RED }} />}
                        <span className="ml-auto text-[10px] leading-none">{journal[k] && '📔'}{byDay.capsules[k] && '💌'}{byDay.books[k] && '📚'}</span>
                      </div>
                      {/* Focus, drawn as a pencil line along the bottom */}
                      {prefs.show.focus && mins > 0 && (
                        <span className="absolute left-1 bottom-0.5 h-[3px] rounded-full bg-moss/70" style={{ width: `calc(${Math.min(mins / Math.max(settings.dailyGoal, 1), 1) * 100}% - 8px)` }} title={formatMinutes(mins)} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-hand text-lg opacity-75 px-1">
                {prefs.show.focus && <span className="flex items-center gap-1.5"><span className="w-6 h-[3px] rounded-full bg-moss/70" /> odak</span>}
                {prefs.show.classes && <span className="flex items-center gap-1.5"><span className="flex gap-0.5">{subjects.slice(0, 3).map(s => <span key={s.id} className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />)}</span> dersler</span>}
                <span>🎯 sınav</span><span>📔 günlük</span><span>💌 kapsül</span><span>📚 biten kitap</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 The day, on a pinned notepad page */}
        <aside className="relative xl:sticky xl:top-28 pt-4" key={selected}>
          <span className="absolute top-1 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff8a7a,#c0392b_60%,#7d1f16)] shadow-[1px_3px_3px_rgba(0,0,0,0.35)]" aria-hidden />
          <div className="paper paper-lines rounded-sm p-5 pt-6 space-y-5 shadow-[0_2px_3px_rgba(0,0,0,0.08),0_20px_36px_-22px_rgba(60,40,20,0.5)] rotate-[0.8deg] animate-fade-in">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] opacity-60">{isToday(sel) ? 'Bugün' : format(sel, 'EEEE', { locale: tr })}</p>
              <div className="flex items-end justify-between">
                <h2 className="font-hand text-5xl leading-none">{format(sel, 'd MMMM', { locale: tr })}</h2>
                {selMood && <span className="text-3xl" title={MOODS.find(m => m.value === selMood.mood)?.label}>{MOODS.find(m => m.value === selMood.mood)?.emoji}</span>}
              </div>
              <div className="flex gap-2 mt-3 text-xs font-black">
                <span className="px-2.5 py-1 rounded-[3px] -rotate-1 shadow-sm" style={{ background: highlight, color: '#3b2f2a' }}>🍅 {formatMinutes(byDay.minutes[selected] ?? 0)}</span>
                <span className="px-2.5 py-1 rounded-[3px] rotate-1 bg-white/70 shadow-sm">💧 {selHabits.length}/{habits.length} alışkanlık</span>
              </div>
            </div>

            {(byDay.exams[selected] ?? []).length > 0 && (
              <Section title="Sınavlar">
                {byDay.exams[selected].map(e => {
                  const s = subjectById(e.subjectId);
                  return (
                    <div key={e.id} className="flex items-center gap-2 px-3 py-2 rounded-[3px] text-white -rotate-1 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" style={{ background: s?.color ?? RED }}>
                      <span className="text-lg">🎯</span>
                      <div className="min-w-0"><p className="font-bold truncate">{e.title}</p><p className="text-xs opacity-85">{s?.emoji} {s?.name}</p></div>
                    </div>
                  );
                })}
              </Section>
            )}

            <Section title={`Dersler · ${selClasses.length}`}>
              {selClasses.length === 0 ? <p className="font-hand text-xl opacity-70">Ders yok, keyfine bak ☁️</p> : selClasses.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-1 self-stretch rounded-full" style={{ background: c.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{c.title}</p>
                    <p className="text-xs opacity-60 font-semibold flex items-center gap-2"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.start}–{c.end}</span>{c.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.room}</span>}</p>
                  </div>
                </div>
              ))}
            </Section>

            <Section title={`Görevler · ${(byDay.tasks[selected] ?? []).length}`}>
              {(byDay.tasks[selected] ?? []).map(t => (
                <label key={t.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={t.done} onChange={() => setTasks(prev => prev.map(x => (x.id === t.id ? { ...x, done: !x.done, completedAt: !x.done ? new Date().toISOString() : undefined } : x)))} className="w-4 h-4 accent-[var(--color-moss)]" />
                  <span className={cn('flex-1 font-hand text-xl leading-tight', t.done && 'line-through opacity-50')}>{t.title}</span>
                  {t.subjectId && <span className="w-2 h-2 rounded-full" style={{ background: subjectById(t.subjectId)?.color }} />}
                </label>
              ))}
              <form onSubmit={addTask} className="flex gap-2 pt-1">
                <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Bu güne görev yaz…" className="flex-1 min-w-0 px-1 py-1 bg-transparent border-b border-dashed border-current/30 focus:border-solid outline-none font-hand text-xl placeholder:opacity-40" />
                <button disabled={!quick.trim()} className="btn-primary px-3 disabled:opacity-40" aria-label="Görev ekle"><Plus className="w-4 h-4" /></button>
              </form>
            </Section>

            <Section title="Günlük">
              {selJournal ? (
                <Link to={`/study/journal?date=${selected}`} className="block p-3 rounded-[3px] bg-white/60 shadow-sm hover:shadow-md transition-shadow rotate-[-0.5deg]">
                  <p className="font-hand text-2xl leading-tight">{selJournal.mood} {selJournal.title || 'Başlıksız sayfa'}</p>
                  <p className="text-xs opacity-70 line-clamp-2 mt-1">{selJournal.body}</p>
                </Link>
              ) : (
                <Link to={`/study/journal?date=${selected}`} className="flex items-center gap-2 text-sm font-bold text-moss hover:underline"><BookHeart className="w-4 h-4" /> Bu güne bir sayfa yaz <ArrowRight className="w-3.5 h-3.5" /></Link>
              )}
            </Section>

            {(selHabits.length > 0 || byDay.capsules[selected] || byDay.books[selected]) && (
              <Section title="Anılar">
                <div className="flex flex-wrap gap-1.5">
                  {selHabits.map(h => <span key={h.id} className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: h.color }}>{h.emoji} {h.name}</span>)}
                  {(byDay.capsules[selected] ?? []).map(c => <Link key={c.id} to="/study/corner/capsule" className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/70">💌 {c.title}</Link>)}
                  {(byDay.books[selected] ?? []).map(b => <Link key={b.id} to="/study/corner" className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/70">📚 {b.title}</Link>)}
                </div>
              </Section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-55">{title}</h3>
    {children}
  </section>
);
