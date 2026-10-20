import React, { useEffect, useState } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Lock, Sparkles, X, Trash2, Hourglass, Feather } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useCorner } from '../../Hooks/useCorner';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { Capsule, CAPSULE_COLORS, CAPSULE_EMOJIS, CAPSULE_PRESETS, CAPSULE_PROMPTS } from '../../Utils/corner';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';

const today = () => format(new Date(), 'yyyy-MM-dd');
const daysLeft = (c: Capsule) => differenceInCalendarDays(parseISO(c.openAt), new Date());
const isReady = (c: Capsule) => daysLeft(c) <= 0;

/** An envelope with a wax seal. `open` lifts the flap. */
const Envelope: React.FC<{ capsule: Capsule; open?: boolean; className?: string; children?: React.ReactNode }> = ({ capsule, open, className, children }) => (
  <div className={cn('relative isolate aspect-[3/2] [perspective:800px]', className)}>
    <div className="absolute inset-0 rounded-xl shadow-[0_14px_24px_-12px_rgba(0,0,0,0.45)]" style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${capsule.color} 55%, white), color-mix(in srgb, ${capsule.color} 80%, white))` }} />
    {/* Whatever sits inside (a letter) goes between the back and the front folds. */}
    {children}
    {/* Side folds */}
    <div className="absolute inset-0 rounded-xl [clip-path:polygon(0_0,50%_55%,0_100%)]" style={{ background: `color-mix(in srgb, ${capsule.color} 45%, white)` }} />
    <div className="absolute inset-0 rounded-xl [clip-path:polygon(100%_0,50%_55%,100%_100%)]" style={{ background: `color-mix(in srgb, ${capsule.color} 45%, white)` }} />
    <div className="absolute inset-0 rounded-xl [clip-path:polygon(0_100%,50%_48%,100%_100%)]" style={{ background: `color-mix(in srgb, ${capsule.color} 62%, white)` }} />
    {/* Flap */}
    <div className={cn('absolute inset-x-0 top-0 h-[58%] origin-top [transform-style:preserve-3d]', open ? '[transform:rotateX(180deg)] -z-10' : 'z-0')}
      style={{ transition: `transform 0.7s, z-index 0s ${open ? '0.35s' : '0s'}` }}>
      <div className="absolute inset-0 [clip-path:polygon(0_0,100%_0,50%_100%)] [backface-visibility:hidden]" style={{ background: `color-mix(in srgb, ${capsule.color} 72%, white)`, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }} />
      <div className="absolute inset-0 [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)] [backface-visibility:hidden]" style={{ background: `color-mix(in srgb, ${capsule.color} 35%, white)` }} />
    </div>
    {/* Wax seal */}
    {!open && (
      <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[22%] aspect-square rounded-full flex items-center justify-center text-[clamp(14px,2.2vw,26px)] shadow-[0_3px_6px_rgba(0,0,0,0.35),inset_0_-3px_6px_rgba(0,0,0,0.3),inset_0_3px_5px_rgba(255,255,255,0.3)]"
        style={{ background: `radial-gradient(circle at 40% 35%, color-mix(in srgb, ${capsule.color} 70%, white), color-mix(in srgb, ${capsule.color} 75%, black))` }}>
        {capsule.emoji}
      </span>
    )}
  </div>
);

/** Envelope whose flap flips from `from` to the opposite state after `delay` ms. */
const AnimatedEnvelope: React.FC<{ capsule: Capsule; from: boolean; delay: number }> = ({ capsule, from, delay }) => {
  const [open, setOpen] = useState(from);
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(!from), delay);
    return () => window.clearTimeout(t);
  }, [from, delay]);
  return (
    <Envelope capsule={capsule} open={open}>
      <div className={cn('absolute inset-x-[9%] top-[8%] h-[85%] rounded-md bg-[#fffaf0] shadow-md p-3', from ? 'capsule-letter-sink' : 'capsule-letter-rise')}>
        <span className="block h-1.5 w-1/2 rounded bg-ink/15 mb-2" />
        <span className="block h-1.5 w-4/5 rounded bg-ink/10 mb-1.5" />
        <span className="block h-1.5 w-3/4 rounded bg-ink/10" />
      </div>
    </Envelope>
  );
};

export const TimeCapsule: React.FC = () => {
  const { capsules, setCapsules } = useCorner();
  const { preferences } = usePreferences();
  const [draft, setDraft] = useState({ title: '', body: '', emoji: CAPSULE_EMOJIS[0], color: CAPSULE_COLORS[0], openAt: format(addDays(new Date(), 182), 'yyyy-MM-dd') });
  const [sealing, setSealing] = useState<Capsule | null>(null);
  const [reading, setReading] = useState<{ capsule: Capsule; stage: 'opening' | 'letter' } | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(0);

  const sorted = [...capsules].sort((a, b) => Number(isReady(b) && !b.opened) - Number(isReady(a) && !a.opened) || a.openAt.localeCompare(b.openAt));
  const readyCount = capsules.filter(c => isReady(c) && !c.opened).length;

  const seal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.body.trim() || draft.openAt <= today()) return;
    const capsule: Capsule = { id: uuidv4(), ...draft, title: draft.title.trim() || 'Gelecekteki bana', body: draft.body.trim(), createdAt: today(), opened: false };
    setSealing(capsule);
    window.setTimeout(() => {
      setCapsules(prev => [...prev, capsule]);
      setSealing(null);
      setDraft(d => ({ ...d, title: '', body: '' }));
      toast.success(`🔒 Mühürlendi! ${format(parseISO(capsule.openAt), 'd MMMM yyyy', { locale: tr })} tarihinde açılabilecek.`);
    }, 1900);
  };

  const tap = (c: Capsule) => {
    if (!isReady(c)) {
      setShake(c.id);
      window.setTimeout(() => setShake(null), 500);
      toast.info(`⏳ Sabır… ${daysLeft(c)} gün sonra açılabilir.`);
      return;
    }
    if (c.opened) { setReading({ capsule: c, stage: 'letter' }); return; }
    setReading({ capsule: c, stage: 'opening' });
    window.setTimeout(() => {
      setReading({ capsule: c, stage: 'letter' });
      setCapsules(prev => prev.map(x => (x.id === c.id ? { ...x, opened: true } : x)));
      if (preferences.celebrate) fireConfetti(140);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Zaman Kapsülü ⏳</h1>
        <p className="text-ink-soft mt-2">Gelecekteki sana bir mektup yaz, mühürle. O gün gelene kadar sen bile okuyamazsın.
          {readyCount > 0 && <b className="text-moss"> {readyCount} mektubun açılmayı bekliyor! ✨</b>}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 items-start">
        {/* Writing desk */}
        <form onSubmit={seal} className="relative rounded-[28px] p-6 sm:p-8 bg-[#fffaf0] dark:bg-[#2b241d] shadow-[0_24px_40px_-24px_rgba(80,50,30,0.45)] border border-[#ecdcc0] dark:border-[#463a2e] overflow-hidden">
          <span className="absolute top-0 bottom-0 left-12 w-px bg-clay/30" aria-hidden />
          <div className="relative pl-8 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-1.5"><Feather className="w-3.5 h-3.5" /> {format(new Date(), 'd MMMM yyyy', { locale: tr })}</p>
              <button type="button" onClick={() => { setPrompt(p => (p + 1) % CAPSULE_PROMPTS.length); }} className="text-xs font-bold text-moss hover:underline">İlham ver ✨</button>
            </div>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Sevgili gelecekteki ben…" className="w-full bg-transparent outline-none font-hand text-4xl text-ink placeholder:text-ink-muted/60" />
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={9} placeholder={CAPSULE_PROMPTS[prompt]}
              className="book-lines w-full bg-transparent outline-none resize-none font-hand text-[26px] leading-[2rem] text-ink placeholder:text-ink-muted/60" />
          </div>
          <div className="relative mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-ink-soft mr-1">Ne zaman açılsın?</span>
              {CAPSULE_PRESETS.map(p => {
                const d = format(addDays(new Date(), p.days), 'yyyy-MM-dd');
                return <button type="button" key={p.days} onClick={() => setDraft({ ...draft, openAt: d })} className={cn('px-3 py-1.5 rounded-full text-xs font-black transition-colors', draft.openAt === d ? 'bg-moss text-white' : 'bg-glass/70 text-ink-soft hover:text-ink')}>{p.label}</button>;
              })}
              <input type="date" min={format(addDays(new Date(), 1), 'yyyy-MM-dd')} value={draft.openAt} onChange={(e) => setDraft({ ...draft, openAt: e.target.value })} className="px-3 py-1.5 glass-input rounded-full text-xs font-bold text-ink" aria-label="Açılış tarihi" />
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-1">
                {CAPSULE_EMOJIS.map(em => <button type="button" key={em} onClick={() => setDraft({ ...draft, emoji: em })} className={cn('w-9 h-9 rounded-full text-lg', draft.emoji === em ? 'bg-moss/15 ring-2 ring-moss/40' : 'hover:bg-glass/60')}>{em}</button>)}
              </div>
              <div className="flex gap-1.5">
                {CAPSULE_COLORS.map(c => <button type="button" key={c} onClick={() => setDraft({ ...draft, color: c })} aria-label={`Zarf rengi ${c}`} className={cn('w-6 h-6 rounded-full border-2', draft.color === c ? 'border-ink scale-110' : 'border-transparent')} style={{ background: c }} />)}
              </div>
            </div>
            <button disabled={!draft.body.trim() || draft.openAt <= today()} className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
              <Lock className="w-4 h-4 mr-2" /> Mühürle · {Math.max(0, differenceInCalendarDays(parseISO(draft.openAt), new Date()))} gün sonra açılır
            </button>
          </div>
        </form>

        {/* Envelopes */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5" /> Kapsüllerim · {capsules.length}</h2>
          {capsules.length === 0 && <p className="glass-panel p-8 text-center text-ink-soft">Henüz mühürlü mektubun yok. İlkini yaz! 💌</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sorted.map(c => {
              const ready = isReady(c);
              const total = Math.max(1, differenceInCalendarDays(parseISO(c.openAt), parseISO(c.createdAt)));
              const passed = Math.min(1, differenceInCalendarDays(new Date(), parseISO(c.createdAt)) / total);
              return (
                <div key={c.id} className="group relative">
                  <button onClick={() => tap(c)} className={cn('w-full text-left glass-panel p-4 transition-transform hover:-translate-y-1', ready && !c.opened && 'capsule-glow', shake === c.id && 'animate-[shake_0.45s_ease-in-out]')}>
                    <Envelope capsule={c} open={c.opened} className={cn(!ready && 'saturate-[0.6] opacity-90')} />
                    <p className="font-bold text-ink mt-3 truncate">{c.title}</p>
                    {ready ? (
                      <p className={cn('text-xs font-black mt-0.5 flex items-center gap-1', c.opened ? 'text-ink-muted' : 'text-moss')}>
                        {c.opened ? 'Açıldı · tekrar oku' : <><Sparkles className="w-3.5 h-3.5" /> Açılmaya hazır!</>}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-ink-muted mt-0.5 flex items-center gap-1"><Lock className="w-3 h-3" /> {daysLeft(c)} gün · {format(parseISO(c.openAt), 'd MMM yyyy', { locale: tr })}</p>
                        <div className="h-1 rounded-full bg-sand/50 mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${passed * 100}%`, background: c.color }} /></div>
                      </>
                    )}
                  </button>
                  <button onClick={() => setCapsules(prev => prev.filter(x => x.id !== c.id))} aria-label="Kapsülü sil"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-cream/80 text-ink-muted hover:text-clay opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sealing animation */}
      {sealing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 backdrop-blur-md animate-fade-in">
          <div className="w-[min(420px,85vw)] relative">
            
            <div className="relative capsule-seal"><AnimatedEnvelope capsule={sealing} from delay={800} /></div>
            <p className="text-center text-white font-black mt-6 text-lg drop-shadow">Mühürleniyor… 🔒</p>
          </div>
        </div>
      )}

      {/* Opening + reading */}
      {reading && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-fade-in" onClick={() => reading.stage === 'letter' && setReading(null)}>
          {reading.stage === 'opening' ? (
            <div className="w-[min(420px,85vw)]">
              <div className="capsule-open-env"><AnimatedEnvelope capsule={reading.capsule} from={false} delay={450} /></div>
              <p className="text-center text-white font-black mt-6 text-lg drop-shadow">Geçmişten bir mektup… ✨</p>
            </div>
          ) : (
            <article onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto custom-scrollbar rounded-2xl bg-[#fffaf0] dark:bg-[#2b241d] shadow-2xl p-8 sm:p-10 capsule-letter-open">
              <button onClick={() => setReading(null)} className="absolute top-4 right-4 btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
              <p className="text-xs font-black uppercase tracking-widest text-ink-muted">{format(parseISO(reading.capsule.createdAt), 'd MMMM yyyy', { locale: tr })} tarihinde yazıldı · {differenceInCalendarDays(new Date(), parseISO(reading.capsule.createdAt))} gün önce</p>
              <h2 className="font-hand text-5xl text-ink mt-3">{reading.capsule.emoji} {reading.capsule.title}</h2>
              <p className="book-lines font-hand text-[26px] leading-[2rem] text-ink mt-4 whitespace-pre-wrap">{reading.capsule.body}</p>
            </article>
          )}
        </div>
      )}
    </div>
  );
};
