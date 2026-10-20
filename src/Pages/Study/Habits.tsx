import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Minus, Flame, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePersonal } from '../../Hooks/usePersonal';
import { useHabitActions } from '../../Hooks/useHabitActions';
import { Habit, HABIT_COLORS, HABIT_EMOJIS, habitDone, habitStreak } from '../../Utils/personal';
import { cn } from '../../Utils/classNames';
import { HabitJar } from '../../Components/HabitJar';
import { DecorPicker } from '../../Components/DecorPicker';

const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');
const WEEKS = 5;

/** A progress ring with the emoji in the middle. */
export const HabitRing: React.FC<{ habit: Habit; size?: number; value: number }> = ({ habit, size = 84, value }) => {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const p = Math.min(value / habit.target, 1);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="7" className="stroke-sand/50" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="7" strokeLinecap="round" stroke={habit.color}
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <span className={cn('absolute inset-0 flex items-center justify-center', size > 60 ? 'text-3xl' : 'text-xl', p >= 1 && 'animate-[pop_0.4s_ease-out]')}>{p >= 1 ? '✅' : habit.emoji}</span>
    </div>
  );
};

export const Habits: React.FC = () => {
  const { habits, setHabits } = usePersonal();
  const { bump, today } = useHabitActions();
  const [form, setForm] = useState<{ name: string; emoji: string; color: string; target: number; unit: string } | null>(null);

  const doneToday = habits.filter(h => habitDone(h, today)).length;
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => subDays(new Date(), WEEKS * 7 - 1 - i));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name.trim()) return;
    setHabits(prev => [...prev, { id: uuidv4(), name: form.name.trim(), emoji: form.emoji, color: form.color, target: Math.max(1, form.target), unit: form.unit.trim(), log: {}, createdAt: new Date().toISOString() }]);
    setForm(null);
  };

  const overall = habits.length ? habits.reduce((s, h) => s + Math.min((h.log[today] ?? 0) / h.target, 1), 0) / habits.length : 0;
  const shelves = Array.from({ length: Math.max(1, Math.ceil(habits.length / 4)) }, (_, i) => habits.slice(i * 4, i * 4 + 4));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Alışkanlık Rafım 🫙</h1>
          <p className="text-ink-soft mt-2">Kavanoza dokun, bir tane ekle. Bugün {habits.length} alışkanlığın {doneToday} tanesi doldu · %{Math.round(overall * 100)}</p>
        </div>
        <div className="flex gap-2">
          <DecorPicker rows={['wood']} />
          <button onClick={() => setForm({ name: '', emoji: HABIT_EMOJIS[0], color: HABIT_COLORS[habits.length % HABIT_COLORS.length], target: 1, unit: '' })} className="btn-primary px-5 py-3 text-sm w-fit">
            <Plus className="w-4 h-4 mr-1.5" /> Kavanoz ekle
          </button>
        </div>
      </div>

      {/* The shelf */}
      <div className="wood-case wood-grain rounded-3xl p-4 sm:p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]">
        <div className="space-y-6">
          {shelves.map((row, i) => (
            <div key={i}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 px-2 sm:px-6 pt-4 rounded-t-lg bg-black/15 shadow-[inset_0_10px_18px_-8px_rgba(0,0,0,0.55)]">
                {row.map(h => {
                  const value = h.log[today] ?? 0;
                  const streak = habitStreak(h);
                  return (
                    <div key={h.id} className="group relative flex flex-col items-center">
                      <HabitJar habit={h} value={value} onTap={() => bump(h, 1)} className="w-24 sm:w-28 h-32 sm:h-36" />
                      {/* Price-tag style label hanging off the shelf */}
                      <div className="relative -mb-2 mt-1 px-3 py-1.5 rounded-md bg-[#fffaf0] text-[#3b2f2a] shadow-md text-center min-w-[7.5rem] rotate-[-1deg]">
                        <p className="font-hand text-xl leading-5 truncate max-w-[9rem]">{h.name}</p>
                        <p className="text-[10px] font-black opacity-70 tabular-nums">{value}/{h.target} {h.unit} · {streak ? `🔥 ${streak}` : 'seri başlat'}</p>
                      </div>
                      <div className="absolute top-0 right-0 sm:right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button onClick={() => bump(h, -1)} disabled={!value} aria-label={`${h.name} −1`} className="w-7 h-7 rounded-full bg-cream/90 text-ink shadow flex items-center justify-center disabled:opacity-30"><Minus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setHabits(prev => prev.filter(x => x.id !== h.id))} aria-label="Alışkanlığı sil" className="w-7 h-7 rounded-full bg-cream/90 text-ink-muted hover:text-clay shadow flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
                {i === shelves.length - 1 && row.length < 4 && (
                  <button onClick={() => setForm({ name: '', emoji: HABIT_EMOJIS[0], color: HABIT_COLORS[habits.length % HABIT_COLORS.length], target: 1, unit: '' })}
                    className="self-end mb-10 mx-auto w-24 sm:w-28 h-28 rounded-2xl border-2 border-dashed border-[var(--wood-text)] text-[var(--wood-text)] opacity-50 hover:opacity-90 flex flex-col items-center justify-center gap-1 font-bold text-xs transition-opacity">
                    <Plus className="w-6 h-6" /> Yeni kavanoz
                  </button>
                )}
              </div>
              <div className="h-5 rounded-b-md wood-plank shadow-[0_8px_12px_-4px_rgba(0,0,0,0.5)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Last five weeks, one strip per habit */}
      <div className="glass-panel p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-ink text-lg">Son 5 hafta</h2>
          <span className="text-xs font-bold text-ink-muted flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-clay" /> koyu kare = hedef tamam</span>
        </div>
        <div className="space-y-3 overflow-x-auto">
          {habits.map(h => (
            <div key={h.id} className="flex items-center gap-3 min-w-[560px]">
              <span className="w-28 shrink-0 text-sm font-bold text-ink truncate">{h.emoji} {h.name}</span>
              <div className="flex-1 grid grid-cols-[repeat(35,minmax(0,1fr))] gap-[3px]">
                {days.map(d => {
                  const v = h.log[dayKey(d)] ?? 0;
                  const ratio = Math.min(v / h.target, 1);
                  return <span key={dayKey(d)} title={`${format(d, 'd MMM', { locale: tr })}: ${v}/${h.target}`}
                    className={cn('aspect-square rounded-[4px]', dayKey(d) === today && 'ring-2 ring-ink/40')}
                    style={{ background: ratio ? h.color : 'color-mix(in srgb, var(--color-sand) 45%, transparent)', opacity: ratio ? 0.3 + ratio * 0.7 : 1 }} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setForm(null)} />
          <form onSubmit={add} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-ink">Yeni alışkanlık</h2>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>
            <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Sabah esneme" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <div className="grid grid-cols-6 gap-1.5">
              {HABIT_EMOJIS.map(e => <button type="button" key={e} onClick={() => setForm({ ...form, emoji: e })} className={cn('aspect-square rounded-xl text-2xl', form.emoji === e ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{e}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-bold text-ink-soft">Günlük hedef
                <input type="number" min={1} max={50} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 glass-input rounded-xl text-ink" />
              </label>
              <label className="text-sm font-bold text-ink-soft">Birim
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="bardak, sayfa…" className="mt-1 w-full px-3 py-2.5 glass-input rounded-xl text-ink" />
              </label>
            </div>
            <div className="flex gap-2">
              {HABIT_COLORS.map(c => <button type="button" key={c} onClick={() => setForm({ ...form, color: c })} aria-label={`Renk ${c}`} className={cn('w-8 h-8 rounded-full border-2', form.color === c ? 'border-ink scale-110' : 'border-white')} style={{ background: c }} />)}
            </div>
            <div className="flex justify-end"><button type="submit" disabled={!form.name.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Ekle</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
