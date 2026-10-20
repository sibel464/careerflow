import React, { useState } from 'react';
import { MapPin, Plus, Trash2, X, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePersonal } from '../../Hooks/usePersonal';
import { useStudy } from '../../Hooks/useStudy';
import { useNow } from '../../Hooks/useNow';
import { ClassSlot, WEEKDAYS_TR, WEEKDAYS_SHORT, toMinutes, todayIndex, classNow } from '../../Utils/personal';
import { SUBJECT_COLORS } from '../../Utils/study';
import { cn } from '../../Utils/classNames';

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 58;

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

type Draft = Omit<ClassSlot, 'id'> & { id?: string };

export const Timetable: React.FC = () => {
  const { timetable, setTimetable } = usePersonal();
  const { subjects } = useStudy();
  const now = new Date(useNow(30000));
  const [weekend, setWeekend] = useState(() => timetable.some(s => s.day >= 5));
  const [draft, setDraft] = useState<Draft | null>(null);

  const days = weekend ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4];
  const { current, next, minutes } = classNow(timetable, now);
  const today = todayIndex(now);
  const nowTop = ((minutes - START_HOUR * 60) / 60) * HOUR_PX;

  const openNew = (day: number, hour: number) =>
    setDraft({ day, start: `${pad(hour)}:00`, end: `${pad(hour + 1)}:00`, title: subjects[0]?.name ?? '', subjectId: subjects[0]?.id, room: '', color: subjects[0]?.color ?? SUBJECT_COLORS[0] });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !draft.title.trim() || toMinutes(draft.end) <= toMinutes(draft.start)) return;
    const slot: ClassSlot = { ...draft, id: draft.id ?? uuidv4(), title: draft.title.trim() };
    setTimetable(prev => (draft.id ? prev.map(s => (s.id === draft.id ? slot : s)) : [...prev, slot]));
    if (slot.day >= 5) setWeekend(true);
    setDraft(null);
  };

  const pickSubject = (id: string) => {
    const subj = subjects.find(s => s.id === id);
    setDraft(d => d && (subj ? { ...d, subjectId: subj.id, title: subj.name, color: subj.color } : { ...d, subjectId: undefined }));
  };

  const totalHours = timetable.reduce((s, c) => s + (toMinutes(c.end) - toMinutes(c.start)), 0) / 60;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Ders Programı 🗓️</h1>
          <p className="text-ink-soft mt-2">Haftalık programın: {timetable.length} ders, haftada {Math.round(totalHours * 10) / 10} saat. Boş bir saate tıklayıp ders ekle.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-ink-soft cursor-pointer">
          <input type="checkbox" checked={weekend} onChange={(e) => setWeekend(e.target.checked)} className="w-4 h-4 accent-[var(--color-moss)]" />
          Hafta sonunu göster
        </label>
      </div>

      {/* Now / next */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={cn('glass-panel p-5 flex items-center gap-4', current && 'ring-2 ring-moss/40')}>
          <span className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md', !current && 'bg-sand')} style={current ? { background: current.color } : undefined}>
            <Clock className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Şu an</p>
            {current ? (
              <>
                <p className="font-bold text-ink truncate">{current.title} <span className="text-ink-muted font-semibold">· {current.room}</span></p>
                <p className="text-xs font-bold text-moss">Bitmesine {toMinutes(current.end) - minutes} dk</p>
              </>
            ) : <p className="font-bold text-ink">Şu an ders yok ☕</p>}
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <span className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md text-xl', !next && 'bg-sand')} style={next ? { background: next.color } : undefined}>⏭</span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Sıradaki</p>
            {next ? (
              <>
                <p className="font-bold text-ink truncate">{next.title} <span className="text-ink-muted font-semibold">· {next.start}</span></p>
                <p className="text-xs font-bold text-clay">{toMinutes(next.start) - minutes} dk sonra{next.room && ` · ${next.room}`}</p>
              </>
            ) : <p className="font-bold text-ink">Bugünlük bu kadar 🎉</p>}
          </div>
        </div>
      </div>

      {/* Week grid */}
      <div className="glass-panel p-3 sm:p-5 overflow-x-auto">
        <div className="min-w-[640px]" style={{ display: 'grid', gridTemplateColumns: `52px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div />
          {days.map(d => (
            <div key={d} className={cn('text-center pb-3 text-sm font-black', d === today ? 'text-moss' : 'text-ink-soft')}>
              <span className="hidden md:inline">{WEEKDAYS_TR[d]}</span><span className="md:hidden">{WEEKDAYS_SHORT[d]}</span>
              {d === today && <span className="block mx-auto mt-1 w-1.5 h-1.5 rounded-full bg-moss" />}
            </div>
          ))}

          {/* Hour labels */}
          <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
              <span key={i} className="absolute right-2 -translate-y-1/2 text-[11px] font-bold text-ink-muted tabular-nums" style={{ top: i * HOUR_PX }}>{pad(START_HOUR + i)}:00</span>
            ))}
          </div>

          {days.map(d => (
            <div key={d} className={cn('relative border-l border-glass/70', d === today && 'bg-moss/[0.04]')} style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <button key={i} onClick={() => openNew(d, START_HOUR + i)} aria-label={`${WEEKDAYS_TR[d]} ${pad(START_HOUR + i)}:00 ders ekle`}
                  className="absolute inset-x-0 border-t border-dashed border-glass/80 group hover:bg-moss/5 transition-colors" style={{ top: i * HOUR_PX, height: HOUR_PX }}>
                  <Plus className="w-4 h-4 mx-auto text-moss opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ))}
              {timetable.filter(s => s.day === d).map(s => {
                const top = ((toMinutes(s.start) - START_HOUR * 60) / 60) * HOUR_PX;
                const height = Math.max(((toMinutes(s.end) - toMinutes(s.start)) / 60) * HOUR_PX - 4, 26);
                const live = current?.id === s.id;
                return (
                  <button key={s.id} onClick={() => setDraft({ ...s })}
                    className={cn('absolute inset-x-1 rounded-xl px-2.5 py-1.5 text-left text-white shadow-md overflow-hidden hover:brightness-110 hover:-translate-y-0.5 transition-all', live && 'ring-2 ring-offset-2 ring-offset-cream ring-white animate-[pulse_3s_ease-in-out_infinite]')}
                    style={{ top: top + 2, height, background: `linear-gradient(160deg, ${s.color}, color-mix(in srgb, ${s.color} 75%, black))` }}>
                    <p className="text-sm font-black leading-tight truncate">{s.title}</p>
                    <p className="text-[11px] font-bold opacity-85">{s.start}–{s.end}</p>
                    {s.room && height > 56 && <p className="text-[11px] font-semibold opacity-80 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.room}</p>}
                  </button>
                );
              })}
              {d === today && nowTop >= 0 && nowTop <= (END_HOUR - START_HOUR) * HOUR_PX && (
                <div className="absolute inset-x-0 z-10 pointer-events-none" style={{ top: nowTop }}>
                  <span className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-clay" />
                  <span className="block h-0.5 bg-clay" />
                  <span className="absolute right-1 -top-5 text-[10px] font-black text-clay">{fmt(minutes)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setDraft(null)} />
          <form onSubmit={save} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-ink">{draft.id ? 'Dersi düzenle' : 'Ders ekle'}</h2>
              <button type="button" onClick={() => setDraft(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map(s => (
                <button type="button" key={s.id} onClick={() => pickSubject(s.id)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all', draft.subjectId === s.id ? 'text-white' : 'text-ink-soft border-transparent bg-glass/50')}
                  style={draft.subjectId === s.id ? { background: s.color, borderColor: s.color } : undefined}>
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, subjectId: undefined })} placeholder="Ders adı" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <div className="grid grid-cols-3 gap-2">
              <select value={draft.day} onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })} className="px-3 py-2.5 glass-input rounded-xl text-sm font-bold text-ink" aria-label="Gün">
                {WEEKDAYS_TR.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
              <input type="time" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} className="px-3 py-2.5 glass-input rounded-xl text-sm font-bold text-ink" aria-label="Başlangıç" />
              <input type="time" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} className="px-3 py-2.5 glass-input rounded-xl text-sm font-bold text-ink" aria-label="Bitiş" />
            </div>
            <input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} placeholder="Derslik / bağlantı (isteğe bağlı)" className="w-full px-4 py-3 glass-input rounded-xl text-ink" />
            <div className="flex gap-2">
              {SUBJECT_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setDraft({ ...draft, color: c })} aria-label={`Renk ${c}`} className={cn('w-7 h-7 rounded-full border-2', draft.color === c ? 'border-ink scale-110' : 'border-white')} style={{ background: c }} />
              ))}
            </div>
            {toMinutes(draft.end) <= toMinutes(draft.start) && <p className="text-xs font-bold text-clay">Bitiş saati başlangıçtan sonra olmalı.</p>}
            <div className="flex justify-between gap-2 pt-1">
              {draft.id ? (
                <button type="button" onClick={() => { setTimetable(prev => prev.filter(s => s.id !== draft.id)); setDraft(null); }} className="btn-ghost px-3 py-2.5 text-sm text-clay"><Trash2 className="w-4 h-4 mr-1.5" /> Sil</button>
              ) : <span />}
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Kaydet</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
