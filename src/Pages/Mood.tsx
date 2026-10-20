import React, { useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Heart, Zap, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { useApplications } from '../Hooks/ApplicationContext';
import { MOOD_KEY, MOODS, MoodEntry, moodFor, todayKey } from '../Utils/mood';
import { activityByDay } from '../Utils/insights';
import { cn } from '../Utils/classNames';

const DAYS = 35;

const JAR_PATH = 'M48 44 Q48 30 62 30 L158 30 Q172 30 172 44 L178 70 Q200 90 200 130 L200 230 Q200 256 174 256 L46 256 Q20 256 20 230 L20 130 Q20 90 42 70 Z';

/** Stable jitter so pebbles don't move around between renders. */
const jitter = (s: string, k: number) => {
  let h = k * 977;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 1000) / 1000) - 0.5;
};

/** A glass jar with one pebble per logged day, oldest at the bottom. */
const MoodJar: React.FC<{ entries: MoodEntry[]; dropping: number }> = ({ entries, dropping }) => {
  const stones = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-70);
  const r = 11.5;
  const perRow = 7;
  const newest = stones[stones.length - 1]?.date;
  return (
    <svg viewBox="0 0 220 270" className="w-full max-w-[300px] mx-auto drop-shadow-[0_18px_18px_rgba(0,0,0,0.18)]" role="img" aria-label={`Duygu kavanozu: ${entries.length} taş`}>
      <defs>
        <clipPath id="mood-jar-clip"><path d={JAR_PATH} /></clipPath>
        <radialGradient id="stone-shine" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stopColor="white" stopOpacity="0.65" /><stop offset="0.45" stopColor="white" stopOpacity="0" /></radialGradient>
      </defs>
      <path d={JAR_PATH} fill="rgba(255,255,255,0.35)" />
      <g clipPath="url(#mood-jar-clip)">
        {stones.map((e, i) => {
          const row = Math.floor(i / perRow);
          const col = i % perRow;
          const cx = 38 + col * 24.5 + (row % 2 ? 11 : 0) + jitter(e.date, 1) * 5;
          const cy = 243 - row * 19.5 + jitter(e.date, 2) * 3;
          const m = moodFor(e.mood);
          const isNew = e.date === newest && dropping > 0;
          return (
            <g key={e.date} className={isNew ? 'stone-drop' : undefined} style={isNew ? { ['--drop' as string]: `${-cy}px` } : undefined}>
              <title>{`${format(parseISO(e.date), 'd MMMM', { locale: tr })}: ${m.label}`}</title>
              <ellipse cx={cx} cy={cy} rx={r + jitter(e.date, 3) * 3} ry={r * 0.82} fill={m.color} transform={`rotate(${jitter(e.date, 4) * 40} ${cx} ${cy})`} />
              <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="url(#stone-shine)" />
            </g>
          );
        })}
      </g>
      <path d={JAR_PATH} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="3" />
      <path d={JAR_PATH} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <path d="M34 120 L32 220" stroke="white" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" />
      {/* Cork lid */}
      <rect x="54" y="8" width="112" height="26" rx="6" fill="#c9a074" />
      <rect x="54" y="8" width="112" height="26" rx="6" fill="url(#cork-dots)" />
      <defs>
        <pattern id="cork-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="rgba(90,55,25,0.35)" /><circle cx="5" cy="4.5" r="0.7" fill="rgba(255,240,210,0.4)" /></pattern>
      </defs>
      {/* Tag */}
      <path d="M150 36 Q165 50 168 64" stroke="#8a6a45" strokeWidth="1.2" fill="none" />
      <g transform="rotate(12 176 76)">
        <rect x="156" y="64" width="44" height="24" rx="4" fill="#fffaf0" stroke="rgba(0,0,0,0.1)" />
        <text x="178" y="80" textAnchor="middle" fontSize="10" fontWeight="800" fill="#3b2f2a">{entries.length} gün</text>
      </g>
    </svg>
  );
};

/** Last 35 days as a grid of colored squares ("year in pixels" style). */
const MoodPixels: React.FC<{ entries: MoodEntry[] }> = ({ entries }) => {
  const byDate = new Map(entries.map(e => [e.date, e]));
  const days = Array.from({ length: DAYS }, (_, i) => subDays(new Date(), DAYS - 1 - i));
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map(d => {
        const k = format(d, 'yyyy-MM-dd');
        const e = byDate.get(k);
        return (
          <div key={k} title={`${format(d, 'd MMMM', { locale: tr })}${e ? `: ${moodFor(e.mood).label}` : ''}`}
            className={cn('aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-transform hover:scale-110', k === todayKey() && 'ring-2 ring-ink/40')}
            style={{ background: e ? moodFor(e.mood).color : 'color-mix(in srgb, var(--color-sand) 40%, transparent)', color: e ? 'white' : 'var(--color-ink-muted)' }}>
            {format(d, 'd')}
          </div>
        );
      })}
    </div>
  );
};

export const Mood: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>(MOOD_KEY, []);
  const { applications } = useApplications();
  const existing = entries.find(e => e.date === todayKey());
  const [draft, setDraft] = useState<MoodEntry>(() => existing ?? { date: todayKey(), mood: 0, energy: 3, note: '', gratitude: '' });
  const [dropping, setDropping] = useState(0);

  const save = () => {
    if (!draft.mood) {
      toast.info('Önce bugünkü taşını seç. 🙂');
      return;
    }
    setEntries(prev => [{ ...draft, date: todayKey() }, ...prev.filter(e => e.date !== todayKey())]);
    setDropping(n => n + 1);
    toast.success(existing ? 'Bugünün taşı güncellendi ✨' : 'Taşın kavanoza düştü! Kendine zaman ayırdığın için teşekkürler 💛');
  };

  const remove = (date: string) => setEntries(prev => prev.filter(e => e.date !== date));

  // Insight: how does career activity relate to mood?
  const activity = activityByDay(applications);
  const avg = (list: MoodEntry[]) => (list.length ? list.reduce((s, e) => s + e.mood, 0) / list.length : 0);
  const activeDays = entries.filter(e => activity.has(e.date));
  const quietDays = entries.filter(e => !activity.has(e.date));
  const overall = avg(entries);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const gratitudes = sorted.filter(e => e.gratitude.trim()).slice(0, 6);
  const counts = MOODS.map(m => ({ ...m, n: entries.filter(e => e.mood === m.value).length }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Duygu Kavanozu 🫙</h1>
        <p className="text-ink-soft mt-2">Her gün bir taş. Kavanoz doldukça kendini daha iyi tanırsın.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* The jar */}
        <div className="xl:col-span-2 glass-panel p-6 flex flex-col">
          <MoodJar entries={entries} dropping={dropping} />
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {counts.map(m => (
              <span key={m.value} className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                <span className="w-3 h-2.5 rounded-[50%]" style={{ background: m.color }} />{m.label} · {m.n}
              </span>
            ))}
          </div>
          <p className="text-center text-xs font-semibold text-ink-muted mt-2">ortalama {overall ? `${moodFor(Math.round(overall)).emoji} ${overall.toFixed(1)}` : '—'}</p>
        </div>

        {/* Today's check-in */}
        <div className="xl:col-span-3 glass-panel p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4">{format(new Date(), 'd MMMM EEEE', { locale: tr })} · bugünün taşını seç</p>
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {MOODS.map((m, i) => {
                const on = draft.mood === m.value;
                return (
                  <button key={m.value} onClick={() => setDraft(d => ({ ...d, mood: m.value }))} aria-pressed={on} className="flex flex-col items-center gap-2 group">
                    <span className={cn('relative w-full aspect-[5/4] flex items-center justify-center text-3xl sm:text-4xl shadow-[inset_-6px_-8px_14px_rgba(0,0,0,0.18),inset_6px_6px_12px_rgba(255,255,255,0.35),0_8px_14px_-6px_rgba(0,0,0,0.35)] transition-all',
                      on ? '-translate-y-2 scale-105' : 'opacity-75 group-hover:opacity-100 group-hover:-translate-y-1')}
                      style={{ background: m.color, borderRadius: ['48% 52% 45% 55% / 55% 50% 50% 45%', '55% 45% 52% 48% / 48% 55% 45% 52%', '50% 50% 48% 52% / 52% 46% 54% 48%', '45% 55% 50% 50% / 50% 52% 48% 50%', '52% 48% 55% 45% / 46% 54% 46% 54%'][i] }}>
                      <span className={cn(on && 'animate-float')}>{m.emoji}</span>
                    </span>
                    <span className={cn('text-xs font-bold', on ? 'text-ink' : 'text-ink-muted')}>{m.label}</span>
                  </button>
                );
              })}
            </div>
            {draft.mood > 0 && <p className="text-sm font-semibold text-moss mt-4 animate-fade-in">{moodFor(draft.mood).message}</p>}
          </div>

          {/* Battery-style energy */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-ink-soft flex items-center gap-1.5 w-24 shrink-0"><Zap className="w-4 h-4 text-sun" /> Enerji</span>
            <div className="flex items-center">
              <div className="flex gap-1 p-1 rounded-lg border-[3px] border-ink/40">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setDraft(d => ({ ...d, energy: v }))} aria-label={`Enerji ${v}`}
                    className="w-7 sm:w-9 h-7 rounded-[4px] transition-colors"
                    style={{ background: v <= draft.energy ? (draft.energy <= 1 ? '#d9534f' : draft.energy <= 2 ? '#e0a923' : '#3a9a6e') : 'color-mix(in srgb, var(--color-sand) 40%, transparent)' }} />
                ))}
              </div>
              <span className="w-1.5 h-4 rounded-r bg-ink/40" />
            </div>
            <span className="text-xs font-black text-ink-muted">%{draft.energy * 20}</span>
          </div>

          {/* Paper notes */}
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block paper rounded-xl p-4 pt-3 shadow-md rotate-[-0.6deg]">
              <span className="block text-xs font-black uppercase tracking-widest opacity-60 mb-1">Bugün neler oldu?</span>
              <textarea rows={4} value={draft.note} onChange={(e) => setDraft(d => ({ ...d, note: e.target.value }))} placeholder="Kısa bir not… 📝"
                className="paper-lines w-full bg-transparent outline-none resize-none font-hand text-[22px] leading-9 placeholder:opacity-40 placeholder:text-[var(--paper-ink)]" />
            </label>
            <label className="block rounded-xl p-4 pt-3 shadow-md rotate-[0.8deg] bg-[#fde9b8] text-[#4a3f35]">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest opacity-60 mb-1"><Heart className="w-3.5 h-3.5" /> Minnettarım…</span>
              <textarea rows={4} value={draft.gratitude} onChange={(e) => setDraft(d => ({ ...d, gratitude: e.target.value }))} placeholder="Sabah kahvem, bir arkadaşın mesajı… ☕"
                className="w-full bg-transparent outline-none resize-none font-hand text-[22px] leading-9 placeholder:opacity-40 placeholder:text-[#4a3f35]" />
            </label>
          </div>

          <button onClick={save} className="btn-primary w-full py-3.5">{existing ? 'Bugünün taşını güncelle ✨' : 'Taşı kavanoza at 🫙'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold font-serif text-ink mb-1">Duygu pikselleri</h3>
          <p className="text-xs font-semibold text-ink-muted mb-4">Son 5 hafta, her kare bir gün</p>
          <MoodPixels entries={entries} />
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold font-serif text-ink mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-sun" /> İçgörü</h3>
          {activeDays.length >= 1 && quietDays.length >= 1 ? (
            <p className="text-sm font-semibold text-ink-soft leading-relaxed">
              Kariyerin için bir şey yaptığın günlerde ruh halin ortalama <b className="text-ink">{moodFor(Math.round(avg(activeDays))).emoji} {avg(activeDays).toFixed(1)}</b>,
              diğer günlerde <b className="text-ink">{moodFor(Math.round(avg(quietDays))).emoji} {avg(quietDays).toFixed(1)}</b>.
              {avg(activeDays) >= avg(quietDays) ? ' Harekete geçmek sana iyi geliyor! 🌱' : ' Yoğun günler seni yoruyor olabilir; aralara molalar serpiştir. 🍃'}
            </p>
          ) : (
            <p className="text-sm font-semibold text-ink-muted">Birkaç gün taş biriktirdikçe burada kendinle ilgili küçük keşifler göreceksin. 🔍</p>
          )}
          {entries.length > 0 && (
            <div className="mt-5 flex items-end gap-1 h-20" aria-label="Enerji ortalaması">
              {[1, 2, 3, 4, 5].map(m => {
                const list = entries.filter(e => e.mood === m);
                const e = list.length ? list.reduce((s, x) => s + x.energy, 0) / list.length : 0;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${moodFor(m).label}: ortalama enerji ${e.toFixed(1)}`}>
                    <div className="w-full rounded-t-md" style={{ height: `${(e / 5) * 100}%`, background: moodFor(m).color, opacity: 0.85 }} />
                    <span className="text-sm">{moodFor(m).emoji}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {gratitudes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold font-serif text-ink mb-4">Minnettarlık notları 💛</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gratitudes.map((e, i) => (
              <div key={e.date} className={cn('relative p-5 pt-6 shadow-md text-[#4a3f35] folded-note', ['bg-[#fde9b8]', 'bg-[#f9d5c5]', 'bg-[#d4ecd9]'][i % 3], i % 2 ? 'rotate-1' : '-rotate-1')}>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/50 rotate-[-2deg] shadow-sm" aria-hidden />
                <p className="font-hand text-2xl leading-7">“{e.gratitude}”</p>
                <p className="text-xs font-bold opacity-60 mt-3">{moodFor(e.mood).emoji} {format(parseISO(e.date), 'd MMMM', { locale: tr })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold font-serif text-ink mb-4">Geçmiş Kayıtlar</h3>
          <div className="space-y-2">
            {sorted.slice(0, 10).map(e => (
              <div key={e.date} className="flex items-start gap-3 p-3 rounded-xl bg-glass/50 border border-glass/70 group">
                <span className="w-9 h-7 rounded-[50%] flex items-center justify-center text-lg shrink-0" style={{ background: moodFor(e.mood).color }}>{moodFor(e.mood).emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink">{format(parseISO(e.date), 'd MMMM EEEE', { locale: tr })} <span className="text-ink-muted font-semibold">· {'⚡'.repeat(e.energy)}</span></p>
                  {e.note && <p className="text-sm text-ink-soft mt-0.5">{e.note}</p>}
                </div>
                <button onClick={() => remove(e.date)} aria-label="Kaydı sil" className="p-1.5 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
