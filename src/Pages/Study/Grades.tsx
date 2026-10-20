import React, { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Trash2, X, Calculator, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { Course, GRADES_KEY, LETTERS, courseStatus, gpa, letterFor, neededFor, seedCourses } from '../../Utils/grades';
import { SUBJECT_COLORS, SUBJECT_EMOJIS } from '../../Utils/study';
import { DecorPicker } from '../../Components/DecorPicker';
import { cn } from '../../Utils/classNames';

const RED = '#b8322a';

/** A score written in red pen; empty means not graded yet. */
const PenScore: React.FC<{ value: number | null; onChange: (v: number | null) => void; label: string }> = ({ value, onChange, label }) => (
  <input inputMode="numeric" aria-label={label} value={value ?? ''} placeholder="—"
    onChange={(e) => {
      const raw = e.target.value.replace(/[^\d.]/g, '');
      onChange(raw === '' ? null : Math.min(100, Math.max(0, Number(raw))));
    }}
    className="w-12 bg-transparent text-center font-hand text-[26px] leading-none outline-none border-b border-dashed border-current/30 focus:border-solid placeholder:opacity-30"
    style={{ color: value === null ? undefined : RED }} />
);

export const Grades: React.FC = () => {
  const [courses, setCourses] = useLocalStorage<Course[]>(GRADES_KEY, seedCourses);
  const { preferences } = usePreferences();
  const [calcId, setCalcId] = useState<string | null>(null);
  const [target, setTarget] = useState('BB');
  const [adding, setAdding] = useState<{ name: string; credit: number; emoji: string } | null>(null);

  const patch = (id: string, fn: (c: Course) => Course) => setCourses(prev => prev.map(c => (c.id === id ? fn(c) : c)));
  const finalGpa = gpa(courses);
  const projected = gpa(courses, true);
  const totalCredits = courses.reduce((s, c) => s + c.credit, 0);
  const calc = courses.find(c => c.id === calcId) ?? courses.find(c => !courseStatus(c).complete) ?? courses[0];
  const targetMin = LETTERS.find(l => l.letter === target)?.min ?? 80;
  const need = calc ? neededFor(calc, targetMin) : null;

  const addCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adding?.name.trim()) return;
    setCourses(prev => [...prev, {
      id: uuidv4(), name: adding.name.trim(), emoji: adding.emoji, credit: Math.max(1, adding.credit), color: SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length],
      items: [{ id: uuidv4(), label: 'Vize', weight: 40, score: null }, { id: uuidv4(), label: 'Final', weight: 60, score: null }],
    }]);
    setAdding(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Not Çizelgem 📜</h1>
          <p className="text-ink-soft mt-2">Notlarını kırmızı kalemle yaz; harf notun, AGNO'n ve finalden kaç alman gerektiği anında hesaplansın.</p>
        </div>
        <div className="flex gap-2">
          <DecorPicker rows={['paper']} />
          <button onClick={() => setAdding({ name: '', credit: 3, emoji: SUBJECT_EMOJIS[0] })} className="btn-primary px-5 py-3 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Ders ekle</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* The report card */}
        <div className="paper relative rounded-sm p-2 shadow-[0_2px_2px_rgba(0,0,0,0.06),0_24px_40px_-24px_rgba(60,40,20,0.45)] rotate-[-0.3deg]">
          <div className="border-[3px] border-double border-current/40 p-5 sm:p-8 relative overflow-hidden">
            {/* Faint guilloche watermark */}
            <svg className="absolute right-6 top-6 w-40 h-40 opacity-[0.07] pointer-events-none" viewBox="0 0 100 100" aria-hidden>
              {Array.from({ length: 18 }, (_, i) => <ellipse key={i} cx="50" cy="50" rx="46" ry="18" fill="none" stroke="currentColor" strokeWidth="0.6" transform={`rotate(${i * 10} 50 50)`} />)}
            </svg>
            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.35em] opacity-60">SİBİLİA AKADEMİ</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">Dönem Not Belgesi</h2>
              <p className="text-xs font-semibold opacity-60 mt-1">{preferences.userName || 'Öğrenci'} · {format(new Date(), 'd MMMM yyyy', { locale: tr })} · {totalCredits} kredi</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm border-collapse">
                <thead>
                  <tr className="border-y-2 border-current/50 text-[10px] uppercase tracking-widest">
                    <th className="text-left py-2 font-black">Ders</th>
                    <th className="py-2 font-black w-14">Kredi</th>
                    <th className="text-left py-2 font-black">Notlar</th>
                    <th className="py-2 font-black w-16">Ort.</th>
                    <th className="py-2 font-black w-16">Harf</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => {
                    const st = courseStatus(c);
                    const score = st.final ?? st.soFar;
                    const letter = score === null ? null : letterFor(score);
                    const weightOff = st.total !== 100;
                    return (
                      <tr key={c.id} className="group border-b border-current/15 align-middle">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-8 rounded-full" style={{ background: c.color }} />
                            <div>
                              <p className="font-bold leading-tight">{c.emoji} {c.name}</p>
                              {weightOff && <p className="text-[10px] font-bold text-[#b8322a] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ağırlıklar %{st.total}</p>}
                            </div>
                            <button onClick={() => setCourses(prev => prev.filter(x => x.id !== c.id))} className="ml-1 p-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-[#b8322a]" aria-label="Dersi sil"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                        <td className="text-center">
                          <input inputMode="numeric" value={c.credit} aria-label="Kredi" onChange={(e) => patch(c.id, x => ({ ...x, credit: Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0) }))}
                            className="w-10 bg-transparent text-center font-bold outline-none" />
                        </td>
                        <td className="py-2">
                          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                            {c.items.map(it => (
                              <div key={it.id} className="group/item flex flex-col items-center relative">
                                <PenScore value={it.score} label={`${c.name} ${it.label}`} onChange={(v) => patch(c.id, x => ({ ...x, items: x.items.map(i => (i.id === it.id ? { ...i, score: v } : i)) }))} />
                                <span className="text-[10px] font-bold opacity-60 whitespace-nowrap">
                                  <input value={it.label} aria-label="Kalem adı" onChange={(e) => patch(c.id, x => ({ ...x, items: x.items.map(i => (i.id === it.id ? { ...i, label: e.target.value.slice(0, 12) } : i)) }))}
                                    className="bg-transparent outline-none text-right" style={{ width: `${Math.max(it.label.length, 3) + 1}ch` }} />%
                                  <input inputMode="numeric" value={it.weight} aria-label={`${it.label} ağırlığı`} onChange={(e) => patch(c.id, x => ({ ...x, items: x.items.map(i => (i.id === it.id ? { ...i, weight: Number(e.target.value.replace(/\D/g, '')) || 0 } : i)) }))}
                                    className="w-6 bg-transparent outline-none font-bold" />
                                </span>
                                <button onClick={() => patch(c.id, x => ({ ...x, items: x.items.filter(i => i.id !== it.id) }))} className="absolute -top-1 -right-2 opacity-0 group-hover/item:opacity-60 hover:!opacity-100" aria-label="Kalemi sil"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <button onClick={() => patch(c.id, x => ({ ...x, items: [...x.items, { id: uuidv4(), label: 'Ödev', weight: 10, score: null }] }))} className="text-[11px] font-bold opacity-40 hover:opacity-90 pb-3" aria-label="Not kalemi ekle"><Plus className="w-3.5 h-3.5 inline" /> ekle</button>
                          </div>
                        </td>
                        <td className="text-center font-hand text-2xl" style={{ color: st.complete ? RED : undefined, opacity: st.complete ? 1 : 0.5 }}>
                          {score === null ? '—' : `${st.complete ? '' : '~'}${Math.round(score)}`}
                        </td>
                        <td className="text-center">
                          {letter ? (
                            <span className={cn('inline-flex items-center justify-center w-11 h-11 rounded-full font-hand text-2xl', st.complete ? 'border-2' : 'border border-dashed opacity-50')}
                              style={{ color: st.complete ? (letter.point >= 2 ? RED : '#7a1f1a') : undefined, borderColor: 'currentColor' }}>
                              {letter.letter}
                            </span>
                          ) : <span className="opacity-30">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals, signature and stamp */}
            <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">AGNO</p>
                  <span className="relative inline-flex items-center justify-center w-24 h-24">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
                      <path d="M50 8 C 78 6, 94 28, 92 52 C 90 78, 68 94, 46 92 C 20 90, 6 70, 9 46 C 12 24, 30 10, 56 9" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <span className="font-hand text-4xl" style={{ color: RED }}>{finalGpa !== null ? finalGpa.toFixed(2) : '—'}</span>
                  </span>
                  <p className="text-[10px] font-semibold opacity-50 mt-1">biten derslerle</p>
                </div>
                <div className="pb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tahmini AGNO</p>
                  <p className="font-hand text-3xl opacity-70">{projected !== null ? projected.toFixed(2) : '—'}</p>
                  <p className="text-[10px] font-semibold opacity-50">şimdiye kadarki notlarla</p>
                </div>
              </div>
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <svg viewBox="0 0 140 40" className="w-32 h-10" aria-hidden>
                    <path d="M6 28 C 18 6, 26 34, 36 18 S 52 8, 58 26 S 76 30, 84 14 C 90 4, 98 30, 110 20 S 128 18, 134 24" fill="none" stroke="#2c3e70" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <p className="border-t border-current/40 pt-1 text-[10px] font-bold opacity-60">Danışman</p>
                </div>
                <div className="official-stamp" aria-hidden>
                  <span>SİBİLİA</span>
                  <b>★ ONAY ★</b>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final calculator */}
        <div className="space-y-5 xl:sticky xl:top-28">
          <div className="calc-body rounded-[22px] p-4 text-[#e9eef3] shadow-[0_18px_30px_-14px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest opacity-70 mb-3"><Calculator className="w-4 h-4" /> FİNALDEN KAÇ?</div>
            <div className="rounded-lg bg-[#b9c6a5] text-[#1d2618] px-3 py-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] font-mono">
              <p className="text-[11px] truncate">{calc ? `${calc.name} → ${target}` : 'Ders ekle'}</p>
              <p className="text-4xl font-black text-right tabular-nums tracking-tight">
                {need === null ? (calc ? 'TAMAM' : '—') : need <= 0 ? '0' : need > 100 ? 'X' : Math.ceil(need)}
              </p>
            </div>
            <p className="text-sm font-bold mt-3 min-h-[2.5rem]">
              {!calc ? '' : need === null ? `Bu dersin tüm notları girildi: ${letterFor(courseStatus(calc).earned).letter} 🎓`
                : need <= 0 ? `${target} zaten garanti! Rahat ol 🎉`
                : need > 100 ? `${target} için kalan notlar yetmiyor. Bir alt harfi dene 💪`
                : `Kalan sınavlardan ortalama ${Math.ceil(need)} alırsan ${target} gelir.`}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {courses.map(c => (
                <button key={c.id} onClick={() => setCalcId(c.id)} className={cn('calc-key text-xs truncate', calc?.id === c.id && 'calc-key-on')}>{c.emoji} {c.name}</button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {LETTERS.slice(0, 8).map(l => (
                <button key={l.letter} onClick={() => setTarget(l.letter)} className={cn('calc-key font-mono', target === l.letter && 'calc-key-on')}>{l.letter}</button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Harf notu tablosu</p>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-ink-soft">
              {LETTERS.map(l => <span key={l.letter} className="px-2 py-1 rounded-lg bg-glass/60">{l.letter} · {l.min}+ · {l.point.toFixed(1)}</span>)}
            </div>
          </div>
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setAdding(null)} />
          <form onSubmit={addCourse} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <h2 className="text-xl font-bold font-serif text-ink">Çizelgeye ders ekle</h2>
            <input autoFocus value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value })} placeholder="Ders adı" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">Kredi / AKTS
              <input type="number" min={1} max={30} value={adding.credit} onChange={(e) => setAdding({ ...adding, credit: Number(e.target.value) })} className="w-20 px-3 py-2 glass-input rounded-xl text-ink" />
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {SUBJECT_EMOJIS.map(em => <button type="button" key={em} onClick={() => setAdding({ ...adding, emoji: em })} className={cn('aspect-square rounded-lg text-xl', adding.emoji === em ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{em}</button>)}
            </div>
            <p className="text-xs text-ink-muted font-semibold">Vize %40 · Final %60 ile başlar; sonra ödev, quiz, proje ekleyebilir ve ağırlıkları değiştirebilirsin.</p>
            <div className="flex justify-end"><button type="submit" disabled={!adding.name.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Ekle</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
