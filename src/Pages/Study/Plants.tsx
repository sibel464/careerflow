import React, { useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { PLANTS_KEY, PLANT_KINDS, POT_COLORS, Plant, PlantKind, seedPlants, statusOf, thirstOf } from '../../Utils/plants';
import { PlantArt } from '../../Components/PlantArt';
import { DecorPicker } from '../../Components/DecorPicker';
import { cn } from '../../Utils/classNames';

const INTERVALS = [2, 3, 4, 5, 7, 10, 14, 21, 30];
const THANKS = ['Oh be! Teşekkürler 💚', 'Kana kana içtim 🌿', 'Yaprağım parlıyor ✨', 'Sen bir tanesin 🪴'];

/** A small watering can that tips over the plant and pours. */
const WateringCan: React.FC = () => (
  <div className="water-pour absolute top-2 left-[calc(50%-88px)] w-16 h-12 z-20 pointer-events-none" aria-hidden>
    <svg viewBox="0 0 64 48" className="w-full h-full">
      <path d="M14 18 L40 18 L42 40 Q42 44 38 44 L16 44 Q12 44 12 40 Z" fill="#7d9cc0" />
      <path d="M40 24 L58 12 L60 15 L42 30 Z" fill="#6a89ad" />
      <rect x="56" y="8" width="7" height="8" rx="2" fill="#5b7a9e" transform="rotate(-30 59 12)" />
      <path d="M18 18 Q27 4 36 18" stroke="#5b7a9e" strokeWidth="3.5" fill="none" />
    </svg>
    {[0, 1, 2, 3, 4].map(i => <span key={i} className="water-drop" style={{ left: `${86 + (i % 3) * 6}%`, animationDelay: `${0.35 + i * 0.12}s` }} />)}
  </div>
);

export const Plants: React.FC = () => {
  const [plants, setPlants] = useLocalStorage<Plant[]>(PLANTS_KEY, seedPlants);
  const [watering, setWatering] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; kind: PlantKind; interval: number; pot: string } | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const due = plants.filter(p => thirstOf(p) >= 1);

  const water = (p: Plant) => {
    if (watering) return;
    setWatering(p.id);
    window.setTimeout(() => {
      setPlants(prev => prev.map(x => (x.id === p.id ? { ...x, lastWatered: today, history: [today, ...x.history.filter(d => d !== today)].slice(0, 30) } : x)));
      setWatering(null);
      toast.success(`${p.name}: ${THANKS[Math.floor(Math.random() * THANKS.length)]}`);
    }, 1300);
  };

  const shelves = Array.from({ length: Math.max(1, Math.ceil(plants.length / 4)) }, (_, i) => plants.slice(i * 4, i * 4 + 4));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Bitkilerim 🪴</h1>
          <p className="text-ink-soft mt-2">{due.length ? `${due.map(p => p.name).join(', ')} su bekliyor. Susayınca yaprakları düşer, sulayınca toparlanır.` : 'Herkes mutlu ve sulanmış. 🌿'}</p>
        </div>
        <div className="flex gap-2">
          <DecorPicker rows={['wood']} />
          <button onClick={() => setForm({ name: '', kind: 'monstera', interval: 7, pot: POT_COLORS[plants.length % POT_COLORS.length] })} className="btn-primary px-5 py-3 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Bitki ekle</button>
        </div>
      </div>

      {/* Windowsill shelves: plants on top, plank, tags hanging below */}
      <div className="space-y-8 pt-4">
        {shelves.map((row, si) => (
          <div key={si}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 px-2 sm:px-8 items-end">
              {row.map(p => {
                const thirst = thirstOf(p);
                const st = statusOf(p);
                return (
                  <div key={p.id} className="group relative flex justify-center">
                    {watering === p.id && <WateringCan />}
                    <button onClick={() => water(p)} title={`${p.name}: sula`} aria-label={`${p.name} sula`} className="relative focus:outline-none -mb-1.5">
                      <PlantArt kind={p.kind} thirst={watering === p.id ? 0 : thirst} pot={p.pot} className="w-32 sm:w-36 h-44 sm:h-48 transition-transform group-hover:-translate-y-1 [&_g]:transition-transform [&_g]:duration-700" />
                      {st.mood === 'thirsty' && <span className="absolute top-2 right-0 px-2 py-0.5 rounded-full bg-white/90 text-xs font-black text-clay shadow animate-bounce">💧?</span>}
                    </button>
                    <button onClick={() => setPlants(prev => prev.filter(x => x.id !== p.id))} aria-label={`${p.name} kaldır`}
                      className="absolute top-0 right-2 w-7 h-7 rounded-full bg-cream/90 text-ink-muted hover:text-clay shadow flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>
            <div className="h-5 rounded-md wood-plank shadow-[0_12px_18px_-8px_rgba(0,0,0,0.5)]" aria-hidden />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 px-2 sm:px-8">
              {row.map(p => {
                const st = statusOf(p);
                return (
                  <div key={p.id} className="flex justify-center">
                    <div className="relative -mt-1 px-3 py-2 rounded-b-md bg-[#fffaf0] text-[#3b2f2a] shadow-md text-center min-w-[8.5rem] origin-top rotate-[1.5deg]">
                      <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3b2f2a]/30" />
                      <p className="font-hand text-2xl leading-6 truncate max-w-[10rem]">{p.name}</p>
                      <p className={cn('text-[11px] font-black', st.mood === 'thirsty' ? 'text-[#b8322a]' : st.mood === 'due' ? 'text-[#c97b5a]' : 'opacity-60')}>{st.text}</p>
                      <p className="text-[10px] font-semibold opacity-50">her {p.interval} günde · son {format(parseISO(p.lastWatered), 'd MMM', { locale: tr })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Watering log */}
      <div className="glass-panel p-5 sm:p-6">
        <h2 className="font-serif font-bold text-lg text-ink mb-4">Sulama defteri</h2>
        <div className="space-y-3 overflow-x-auto">
          {plants.map(p => (
            <div key={p.id} className="flex items-center gap-3 min-w-[520px]">
              <span className="w-28 shrink-0 text-sm font-bold text-ink truncate">{p.name}</span>
              <div className="flex-1 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px]">
                {Array.from({ length: 30 }, (_, i) => {
                  const d = format(new Date(Date.now() - (29 - i) * 86400000), 'yyyy-MM-dd');
                  const wet = p.history.includes(d);
                  return <span key={d} title={d} className={cn('aspect-square rounded-full', d === today && 'ring-2 ring-ink/30')} style={{ background: wet ? '#7d9cc0' : 'color-mix(in srgb, var(--color-sand) 40%, transparent)' }} />;
                })}
              </div>
              <span className="w-24 text-right text-xs font-bold text-ink-muted">{(() => { const d = differenceInCalendarDays(new Date(), parseISO(p.lastWatered)); return d === 0 ? 'bugün' : d === 1 ? 'dün' : `${d} gün önce`; })()}</span>
            </div>
          ))}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setForm(null)} />
          <form role="dialog" aria-modal="true" onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            setPlants(prev => [...prev, { id: uuidv4(), name: form.name.trim(), kind: form.kind, interval: form.interval, pot: form.pot, lastWatered: today, history: [today] }]);
            setForm(null);
          }} className="relative z-10 w-full max-w-lg rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-4 animate-pop">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-ink">Yeni bitki</h2>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PLANT_KINDS.map(k => (
                <button type="button" key={k.id} onClick={() => setForm({ ...form, kind: k.id, interval: k.interval })}
                  className={cn('rounded-2xl p-1 flex flex-col items-center', form.kind === k.id ? 'bg-moss/10 ring-2 ring-moss' : 'hover:bg-glass/60')}>
                  <PlantArt kind={k.id} thirst={0} pot={form.pot} className="w-14 h-20" />
                  <span className="text-[10px] font-bold text-ink-soft text-center leading-tight">{k.name}</span>
                </button>
              ))}
            </div>
            <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Adı ne? (örn: Monti)" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            <div>
              <p className="text-sm font-bold text-ink-soft mb-2">Kaç günde bir sulanır?</p>
              <div className="flex flex-wrap gap-1.5">
                {INTERVALS.map(n => <button type="button" key={n} onClick={() => setForm({ ...form, interval: n })} className={cn('px-3 py-1.5 rounded-full text-xs font-black', form.interval === n ? 'bg-moss text-white' : 'bg-glass/70 text-ink-soft')}>{n} gün</button>)}
              </div>
            </div>
            <div className="flex gap-2">
              {POT_COLORS.map(c => <button type="button" key={c} onClick={() => setForm({ ...form, pot: c })} aria-label={`Saksı ${c}`} className={cn('w-8 h-8 rounded-lg border-2', form.pot === c ? 'border-ink scale-110' : 'border-transparent')} style={{ background: c }} />)}
            </div>
            <div className="flex justify-end"><button type="submit" disabled={!form.name.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Rafa koy</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
