import React, { useEffect, useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Trash2, X, Flag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { useStudy } from '../../Hooks/useStudy';
import { useCorner } from '../../Hooks/useCorner';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { GOALS_KEY, GOAL_EMOJIS, Goal, GoalKind, KIND_INFO, goalProgress, migrateGoals, seedGoals } from '../../Utils/goals';
import { MAP_H, MAP_W, pointAt, trailD } from '../../Utils/mapPath';
import { Avatar } from '../../Components/Avatar';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';

const LANDMARKS = ['🏕️', '🌉', '🌲', '⛰️', '🏯', '⛵', '🗿', '🏝️', '🌋'];
const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / MAP_W) * 100}%`, top: `${(p.y / MAP_H) * 100}%` });

/** Hand-inked scenery around the trail. */
const MapArt: React.FC<{ fraction: number }> = ({ fraction }) => (
  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 w-full h-full" aria-hidden>
    {/* Sea with waves */}
    <path d="M0 0 H330 Q300 40 250 60 Q170 90 120 70 Q60 50 0 90 Z" fill="#a9c7c9" opacity="0.55" />
    {[[40, 30], [120, 22], [200, 34], [70, 60]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q8 -6 16 0 t16 0`} stroke="#5f8a8f" strokeWidth="2" fill="none" />)}
    {/* Lake */}
    <ellipse cx="760" cy="420" rx="90" ry="42" fill="#a9c7c9" opacity="0.6" stroke="#6f9498" strokeWidth="2" />
    <path d="M720 418 q8 -5 16 0 t16 0 M770 432 q8 -5 16 0 t16 0" stroke="#5f8a8f" strokeWidth="1.6" fill="none" />
    {/* Mountains */}
    {[[420, 120, 60], [480, 110, 70], [545, 138, 46], [120, 220, 50], [170, 210, 40]].map(([x, y, s], i) => (
      <g key={i}>
        <path d={`M${x - s / 2} ${y + s * 0.6} L${x} ${y - s * 0.4} L${x + s / 2} ${y + s * 0.6} Z`} fill="#d7c29a" stroke="#7a5f3e" strokeWidth="2" strokeLinejoin="round" />
        <path d={`M${x} ${y - s * 0.4} L${x + s * 0.18} ${y + s * 0.6} M${x + 5} ${y - s * 0.1} l8 10 M${x + 8} ${y + s * 0.15} l8 10`} stroke="#7a5f3e" strokeWidth="1.2" />
        <path d={`M${x - s * 0.12} ${y - s * 0.2} L${x} ${y - s * 0.4} L${x + s * 0.12} ${y - s * 0.2} L${x + s * 0.04} ${y - s * 0.14} L${x - s * 0.04} ${y - s * 0.22} Z`} fill="#fbf6ea" />
      </g>
    ))}
    {/* Forests */}
    {[[310, 420], [340, 440], [370, 418], [400, 446], [640, 470], [670, 455], [700, 478], [860, 300], [890, 320], [830, 330], [60, 330], [90, 355]].map(([x, y], i) => (
      <g key={i}>
        <path d={`M${x} ${y - 22} L${x - 11} ${y} L${x + 11} ${y} Z`} fill="#8fa77f" stroke="#55704a" strokeWidth="1.6" strokeLinejoin="round" />
        <line x1={x} y1={y} x2={x} y2={y + 7} stroke="#6b4a32" strokeWidth="2" />
      </g>
    ))}
    {/* Compass rose */}
    <g transform="translate(925 470)">
      <circle r="40" fill="none" stroke="#7a5f3e" strokeWidth="1.5" />
      <circle r="32" fill="none" stroke="#7a5f3e" strokeWidth="0.8" strokeDasharray="2 3" />
      <path d="M0 -38 L7 0 L0 38 L-7 0 Z" fill="#b8322a" opacity="0.85" />
      <path d="M-38 0 L0 -6 L38 0 L0 6 Z" fill="#7a5f3e" opacity="0.7" />
      <text y="-46" textAnchor="middle" fontSize="14" fontWeight="800" fill="#7a5f3e" fontFamily="Lora, serif">K</text>
    </g>
    {/* Trail: inked dashes, and the part already walked in red */}
    <path d={trailD()} fill="none" stroke="#8a6a45" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
    <path d={trailD()} fill="none" stroke="#b8322a" strokeWidth="5" strokeLinecap="round" pathLength={1}
      strokeDasharray={`${fraction} 1`} style={{ transition: 'stroke-dasharray 1.2s ease' }} opacity="0.85" />
    {/* X marks the spot */}
    <g transform="translate(930 150)" stroke="#b8322a" strokeWidth="6" strokeLinecap="round"><path d="M-14 -14 L14 14 M14 -14 L-14 14" /></g>
  </svg>
);

export const Goals: React.FC = () => {
  const [goals, setGoals] = useLocalStorage<Goal[]>(GOALS_KEY, seedGoals);
  useEffect(() => { setGoals(migrateGoals); }, [setGoals]);
  const { log } = useStudy();
  const { books } = useCorner();
  const { preferences } = usePreferences();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');
  const [form, setForm] = useState<{ title: string; emoji: string; kind: GoalKind; target: number; deadline: string; steps: string } | null>(null);

  const goal = goals.find(g => g.id === selectedId) ?? goals[0];
  const prog = goal ? goalProgress(goal, log, books) : null;
  const daysLeft = goal?.deadline ? differenceInCalendarDays(parseISO(goal.deadline), new Date()) : null;
  const n = prog?.stops.length ?? 0;
  const here = pointAt(prog?.fraction ?? 0);
  const done = (prog?.fraction ?? 0) >= 1;

  const patch = (id: string, fn: (g: Goal) => Goal) => setGoals(prev => prev.map(g => (g.id === id ? fn(g) : g)));

  const toggleStop = (stopId: string) => {
    if (!goal || goal.kind !== 'steps') return;
    const milestones = goal.milestones.map(x => (x.id === stopId ? { ...x, done: !x.done, doneAt: !x.done ? format(new Date(), 'yyyy-MM-dd') : undefined } : x));
    patch(goal.id, g => ({ ...g, milestones }));
    const stop = milestones.find(x => x.id === stopId);
    if (stop?.done && preferences.celebrate) {
      const all = milestones.every(x => x.done);
      fireConfetti(all ? 200 : 50);
      toast.success(all ? `🏆 "${goal.title}" — hazineye ulaştın!` : `🚩 ${stop.title} — bir durak daha!`);
    }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.title.trim()) return;
    const id = uuidv4();
    setGoals(prev => [...prev, {
      id, title: form.title.trim(), emoji: form.emoji, kind: form.kind, target: Math.max(1, form.target), since: format(new Date(), 'yyyy-MM-dd'),
      deadline: form.deadline || undefined, createdAt: new Date().toISOString(),
      milestones: form.kind === 'steps' ? form.steps.split('\n').map(s => s.trim()).filter(Boolean).map(t => ({ id: uuidv4(), title: t, done: false })) : [],
    }]);
    setSelectedId(id);
    setForm(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Hedef Haritam 🗺️</h1>
          <p className="text-ink-soft mt-2">Her büyük hedef bir yolculuk. İlerledikçe yolda yürür, hazineye yaklaşırsın.</p>
        </div>
        <button onClick={() => setForm({ title: '', emoji: GOAL_EMOJIS[0], kind: 'steps', target: 10, deadline: '', steps: '' })} className="btn-primary px-5 py-3 text-sm w-fit"><Plus className="w-4 h-4 mr-1.5" /> Yeni hedef</button>
      </div>

      {/* Rolled-up maps to choose from */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-1">
        {goals.map(g => {
          const p = goalProgress(g, log, books);
          const on = goal?.id === g.id;
          return (
            <button key={g.id} onClick={() => setSelectedId(g.id)}
              className={cn('parchment-chip shrink-0 flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-xl text-left transition-all', on ? '-translate-y-1 shadow-lg ring-2 ring-[#b8322a]/50' : 'opacity-80 hover:opacity-100')}>
              <span className="text-2xl">{g.emoji}</span>
              <span className="min-w-0">
                <span className="block font-hand text-xl leading-5 text-[#4a3524] max-w-[12rem] truncate">{g.title}</span>
                <span className="block h-1.5 w-28 mt-1 rounded-full bg-[#4a3524]/15 overflow-hidden"><span className="block h-full bg-[#b8322a]" style={{ width: `${p.fraction * 100}%` }} /></span>
              </span>
              <span className="text-xs font-black text-[#4a3524]/70">%{Math.round(p.fraction * 100)}</span>
            </button>
          );
        })}
      </div>

      {goal && prog ? (
        <>
          {/* The map */}
          <div className="overflow-x-auto pb-2">
            <div className="parchment relative min-w-[720px] w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
              <MapArt fraction={prog.fraction} />

              {/* Title cartouche */}
              <div className="absolute left-[3%] top-[5%] max-w-[34%] px-4 py-2 rounded-md bg-[#f6ead0]/90 border-2 border-[#7a5f3e]/60 shadow-md rotate-[-2deg]">
                <p className="text-[10px] font-black tracking-[0.25em] text-[#7a5f3e]">YOLCULUK</p>
                <p className="font-hand text-2xl sm:text-3xl leading-7 text-[#3b2a1a]">{goal.emoji} {goal.title}</p>
              </div>

              {/* Start */}
              <span className="absolute -translate-x-1/2 translate-y-2 font-hand text-lg text-[#4a3524] whitespace-nowrap" style={pct(pointAt(0))}>🏁 başlangıç</span>

              {/* Milestones */}
              {prog.stops.map((s, i) => {
                const pos = pointAt((i + 1) / n);
                const last = i === n - 1;
                const above = i % 2 === 0;
                return (
                  <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(pos)}>
                    <button onClick={() => toggleStop(s.id)} disabled={goal.kind !== 'steps'} title={goal.kind === 'steps' ? (s.done ? 'Geri al' : 'Buraya vardım!') : s.title}
                      className={cn('relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-transform', goal.kind === 'steps' && 'hover:scale-110',
                        s.done ? 'bg-[#f6ead0] ring-[3px] ring-[#b8322a]/70' : 'bg-[#f6ead0]/70 ring-2 ring-dashed ring-[#7a5f3e]/50 grayscale-[0.5]')}>
                      {last ? (done ? '💎' : '🧰') : LANDMARKS[i % LANDMARKS.length]}
                      {s.done && <Flag className="absolute -top-3 -right-1 w-5 h-5 text-[#b8322a] fill-[#b8322a] drop-shadow" />}
                    </button>
                    <span className={cn('absolute z-20 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#fbf3df]/90 font-hand text-base sm:text-lg leading-5 text-[#3b2a1a] shadow-sm max-w-[11rem] truncate',
                      above ? 'bottom-full mb-1.5' : 'top-full mt-1.5', s.done && 'line-through decoration-[#b8322a]/70')}>
                      {s.title}
                    </span>
                  </div>
                );
              })}

              {/* You are here */}
              <div className="absolute z-10 -translate-x-1/2 -translate-y-[85%] transition-all duration-1000 ease-out" style={pct(here)}>
                <div className={cn('relative flex flex-col items-center', !done && 'animate-[float_2.6s_ease-in-out_infinite]')}>
                  <span className="mb-1 px-2 py-0.5 rounded-full bg-[#3b2a1a] text-[#f6ead0] text-[11px] font-black whitespace-nowrap shadow">
                    {done ? 'Hazine senin! 🎉' : `%${Math.round(prog.fraction * 100)} yol`}
                  </span>
                  <Avatar config={preferences.look} rounded="rounded-full" noBadge className="w-12 h-12 sm:w-14 sm:h-14 ring-[3px] ring-[#f6ead0] shadow-lg" />
                  <span className="w-8 h-2 rounded-[50%] bg-black/25 mt-0.5 blur-[1px]" />
                </div>
              </div>

              {done && <span className="treasure-stamp">BAŞARILDI</span>}
            </div>
          </div>

          {/* Logbook */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div className="glass-panel p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-ink-muted">Seyir defteri</p>
                  <p className="text-2xl font-black text-ink mt-1 tabular-nums">
                    {goal.kind === 'steps' ? `${prog.value} / ${prog.total} durak` : `${goal.kind === 'focus' ? prog.value.toFixed(1) : prog.value} / ${prog.total} ${KIND_INFO[goal.kind].unit}`}
                  </p>
                  <p className="text-xs font-semibold text-ink-muted mt-0.5">{KIND_INFO[goal.kind].hint} · {format(parseISO(goal.since), 'd MMMM', { locale: tr })}'dan beri</p>
                </div>
                <button onClick={() => { setGoals(prev => prev.filter(g => g.id !== goal.id)); setSelectedId(null); }} className="p-2 rounded-lg text-ink-muted hover:text-clay hover:bg-glass/60" aria-label="Hedefi sil"><Trash2 className="w-4 h-4" /></button>
              </div>
              {goal.kind === 'steps' ? (
                <div className="space-y-1.5">
                  {goal.milestones.map((s, i) => (
                    <div key={s.id} className="group flex items-center gap-3 p-2.5 rounded-xl bg-glass/50 border border-glass/60">
                      <button onClick={() => toggleStop(s.id)} className={cn('w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0', s.done ? 'bg-[#b8322a] text-white' : 'border-2 border-dashed border-ink-muted')}>
                        {s.done ? '✓' : i + 1}
                      </button>
                      <input value={s.title} onChange={(e) => patch(goal.id, g => ({ ...g, milestones: g.milestones.map(x => (x.id === s.id ? { ...x, title: e.target.value } : x)) }))}
                        className={cn('flex-1 bg-transparent outline-none font-semibold text-sm', s.done ? 'text-ink-muted line-through' : 'text-ink')} aria-label="Durak adı" />
                      {s.doneAt && <span className="text-[11px] font-bold text-ink-muted">{format(parseISO(s.doneAt), 'd MMM', { locale: tr })}</span>}
                      <button onClick={() => patch(goal.id, g => ({ ...g, milestones: g.milestones.filter(x => x.id !== s.id) }))} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-ink-muted hover:text-clay" aria-label="Durağı sil"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); if (!newStep.trim()) return; patch(goal.id, g => ({ ...g, milestones: [...g.milestones, { id: uuidv4(), title: newStep.trim(), done: false }] })); setNewStep(''); }} className="flex gap-2 pt-1">
                    <input value={newStep} onChange={(e) => setNewStep(e.target.value)} placeholder="Yeni durak ekle…" className="flex-1 px-3 py-2.5 glass-input rounded-xl text-sm text-ink" />
                    <button className="btn-primary px-3" aria-label="Durak ekle"><Plus className="w-4 h-4" /></button>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="h-3 rounded-full bg-sand/50 overflow-hidden"><div className="h-full rounded-full bg-[#b8322a] transition-all duration-700" style={{ width: `${prog.fraction * 100}%` }} /></div>
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-soft mt-4">Hedef
                    <input type="number" min={1} value={goal.target} onChange={(e) => patch(goal.id, g => ({ ...g, target: Math.max(1, Number(e.target.value)) }))} className="w-24 px-3 py-2 glass-input rounded-xl text-ink" /> {KIND_INFO[goal.kind].unit}
                  </label>
                </div>
              )}
            </div>

            <div className="glass-panel p-5 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-ink-muted">Son tarih</p>
              {daysLeft !== null ? (
                <>
                  <p className={cn('text-5xl font-black tabular-nums mt-2', daysLeft < 0 ? 'text-ink-muted' : daysLeft <= 7 ? 'text-clay' : 'text-ink')}>{Math.abs(daysLeft)}</p>
                  <p className="text-sm font-bold text-ink-soft">{daysLeft < 0 ? 'gün geçti' : 'gün kaldı'} · {format(parseISO(goal.deadline!), 'd MMMM yyyy', { locale: tr })}</p>
                </>
              ) : <p className="text-sm text-ink-muted mt-2">Tarih yok, kendi hızında 🐢</p>}
              <input type="date" value={goal.deadline ?? ''} onChange={(e) => patch(goal.id, g => ({ ...g, deadline: e.target.value || undefined }))} className="mt-3 px-3 py-2 glass-input rounded-xl text-sm text-ink" aria-label="Son tarih" />
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-12 text-center text-ink-soft">İlk hedefini ekle, haritan çizilsin 🗺️</div>
      )}

      {form && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setForm(null)} />
          <form onSubmit={create} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-ink">Yeni yolculuk</h2>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>
            <input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hedefin ne? (örn: YDS'den 80 al)" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <div className="flex flex-wrap gap-1">
              {GOAL_EMOJIS.map(em => <button type="button" key={em} onClick={() => setForm({ ...form, emoji: em })} className={cn('w-9 h-9 rounded-lg text-xl', form.emoji === em ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{em}</button>)}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(KIND_INFO) as GoalKind[]).map(k => (
                <button type="button" key={k} onClick={() => setForm({ ...form, kind: k, target: k === 'focus' ? 30 : k === 'books' ? 6 : form.target })}
                  className={cn('p-3 rounded-2xl text-left border-2 transition-colors', form.kind === k ? 'border-moss bg-moss/10' : 'border-transparent bg-glass/50 hover:bg-glass/80')}>
                  <p className="text-sm font-black text-ink">{KIND_INFO[k].label}</p>
                  <p className="text-[11px] font-semibold text-ink-muted leading-tight mt-0.5">{KIND_INFO[k].hint}</p>
                </button>
              ))}
            </div>
            {form.kind === 'steps' ? (
              <textarea value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} rows={4} placeholder={'Her satıra bir durak:\nKelime listesi hazırla\nHer gün 20 kelime\nDeneme sınavı 70+\nSınav günü 🎉'}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm text-ink resize-none" />
            ) : (
              <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">Hedef
                <input type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} className="w-24 px-3 py-2 glass-input rounded-xl text-ink" /> {KIND_INFO[form.kind].unit}
              </label>
            )}
            <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">Son tarih (isteğe bağlı)
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="px-3 py-2 glass-input rounded-xl text-ink text-sm" />
            </label>
            <div className="flex justify-end"><button type="submit" disabled={!form.title.trim() || (form.kind === 'steps' && !form.steps.trim())} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Haritayı çiz 🗺️</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
