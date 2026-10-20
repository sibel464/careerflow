import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { DATA_EVENT, readStored, useLocalStorage } from '../../Hooks/useLocalStorage';
import { useStudy } from '../../Hooks/useStudy';
import { useNow } from '../../Hooks/useNow';
import { useCorner } from '../../Hooks/useCorner';
import { STUDY_KEYS, StudyLog, StudyTask } from '../../Utils/study';
import { PET_COLORS, PET_KEY, artBox, PetState, SPECIES, Species, chatter, clamp, decayed, growth, newPet, petTraits, Trait } from '../../Utils/pet';
import { PetArt } from './PetArt';
import { cn } from '../../Utils/classNames';

type Pose = 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'happy' | 'eat' | 'held';
type Spot = { x: number; y: number };

const FOOD_COST = 2;
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNight = () => { const h = new Date().getHours(); return h >= 23 || h < 7; };

const Bar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-[11px] font-bold text-ink-soft"><span>{label}</span><span>%{Math.round(value)}</span></div>
    <div className="h-2 rounded-full bg-sand/50 overflow-hidden mt-0.5">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: value < 25 ? '#d0644a' : color }} />
    </div>
  </div>
);

/** A little pet that wanders all over the screen, grows with your focus time and reacts to your progress. */
export const Pet: React.FC = () => {
  const [stored, setPet] = useLocalStorage<PetState>(PET_KEY, newPet);
  const { log, tasks, coins, setRedemptions } = useStudy();
  const { books } = useCorner();
  const now = useNow(60_000);
  const pet = decayed(stored, now);
  const { stage, next, toNext, minutes } = growth(stored, log);
  const traits = petTraits(log, tasks, books);
  const activeTraits = traits.filter(t => t.active).map(t => t.id);
  const box = artBox();
  const width = box.width * stage.scale;
  const height = width * box.ratio;

  const node = useRef<HTMLDivElement>(null);
  // Starts by the bottom center, where it's easy to spot.
  const pos = useRef<Spot>({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight - height - 16 });
  const target = useRef<Spot | null>(null);
  const speed = useRef(70);
  const facing = useRef<1 | -1>(1);
  const onArrive = useRef<(() => void) | null>(null);
  const busyUntil = useRef(0);
  const petRef = useRef(pet);
  const traitsRef = useRef<Trait[]>([]);
  const size = useRef({ width, height });
  useEffect(() => {
    petRef.current = pet;
    traitsRef.current = traits.filter(t => t.active);
    size.current = { width, height };
  });

  const [pose, setPoseState] = useState<Pose>('idle');
  const poseRef = useRef<Pose>('idle');
  const setPose = useCallback((p: Pose) => { poseRef.current = p; setPoseState(p); }, []);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const [panel, setPanel] = useState(false);
  const [ball, setBall] = useState<Spot | null>(null);
  const [bowl, setBowl] = useState<Spot | null>(null);
  const [appearance, setAppearance] = useState(false);

  const say = useCallback((text: string, ms = 4000) => {
    setBubble(text);
    window.setTimeout(() => setBubble(b => (b === text ? null : b)), ms);
  }, []);

  const love = useCallback(() => {
    const id = Date.now();
    setHearts(h => [...h, id]);
    window.setTimeout(() => setHearts(h => h.filter(x => x !== id)), 1400);
  }, []);

  const boost = useCallback((change: Partial<Pick<PetState, 'hunger' | 'happiness'>>) => {
    setPet(p => {
      const d = decayed(p);
      return { ...d, hunger: clamp(d.hunger + (change.hunger ?? 0)), happiness: clamp(d.happiness + (change.happiness ?? 0)) };
    });
  }, [setPet]);

  const randomSpot = useCallback((): Spot => {
    const { width: w, height: h } = size.current;
    return { x: 8 + Math.random() * Math.max(window.innerWidth - w - 16, 10), y: 90 + Math.random() * Math.max(window.innerHeight - h - 100, 10) };
  }, []);

  const goTo = useCallback((spot: Spot, run = false, then?: () => void) => {
    target.current = spot;
    speed.current = run ? 230 : 70;
    onArrive.current = then ?? (() => setPose('idle'));
    setPose(run ? 'run' : 'walk');
  }, [setPose]);

  const celebrate = useCallback((text: string, ms = 1600) => {
    target.current = null;
    busyUntil.current = Date.now() + ms;
    setPose('happy');
    love();
    say(text);
    window.setTimeout(() => poseRef.current === 'happy' && setPose('idle'), ms);
  }, [love, say, setPose]);

  // Movement: glide toward the target every frame, written straight to the DOM.
  useEffect(() => {
    if (!stored.enabled) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const goal = target.current;
      if (goal) {
        const dx = goal.x - pos.current.x;
        const dy = goal.y - pos.current.y;
        const dist = Math.hypot(dx, dy);
        const stepLen = speed.current * dt;
        if (dist <= stepLen) {
          pos.current = { ...goal };
          target.current = null;
          const done = onArrive.current;
          onArrive.current = null;
          done?.();
        } else {
          pos.current.x += (dx / dist) * stepLen;
          pos.current.y += (dy / dist) * stepLen;
          if (Math.abs(dx) > 1) facing.current = dx > 0 ? 1 : -1;
        }
      }
      // Stay on screen when the window shrinks.
      pos.current.x = Math.min(Math.max(pos.current.x, 0), window.innerWidth - size.current.width);
      pos.current.y = Math.min(Math.max(pos.current.y, 0), window.innerHeight - size.current.height);
      const el = node.current;
      if (el) {
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        el.style.setProperty('--face', String(facing.current));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stored.enabled]);

  // Its little mind: wander, sit, nap, chat.
  useEffect(() => {
    if (!stored.enabled) return;
    let timer = 0;
    const think = () => {
      timer = window.setTimeout(think, 3000 + Math.random() * 4500);
      if (Date.now() < busyUntil.current || target.current || poseRef.current === 'held') return;
      // Picked up a new habit? Show it off.
      const fresh = traitsRef.current.filter(t => !(petRef.current.seenTraits ?? []).includes(t.id));
      if (fresh.length && poseRef.current !== 'sleep') {
        setPet(p => ({ ...p, seenTraits: [...(p.seenTraits ?? []), ...fresh.map(t => t.id)] }));
        celebrate(`Bak, ${fresh[0].emoji} ${fresh[0].title} oldum! Yeni halimi beğendin mi? 💫`, 3500);
        return;
      }
      const r = Math.random();
      if (poseRef.current === 'sleep') {
        if (!isNight() && r < 0.25) setPose('idle');
        return;
      }
      if (reducedMotion()) {
        if (r < 0.15) say(pick(chatter(petRef.current)));
        return;
      }
      if (r < (isNight() ? 0.35 : 0.05)) { setPose('sleep'); busyUntil.current = Date.now() + 25_000; return; }
      if (r < 0.62) { goTo(randomSpot()); return; }
      if (r < 0.78) { setPose('sit'); return; }
      if (r < 0.9) { say(pick(chatter(petRef.current))); return; }
      setPose('idle');
    };
    timer = window.setTimeout(think, 6000);
    say(`Merhaba! Ben ${petRef.current.name} 🐾 Bana tıkla!`, 5000);
    setPose('happy');
    window.setTimeout(() => poseRef.current === 'happy' && setPose('sit'), 1000);
    return () => window.clearTimeout(timer);
  }, [stored.enabled, goTo, randomSpot, say, setPose, setPet, celebrate]);

  // Cheer when you make progress anywhere in the app.
  useEffect(() => {
    if (!stored.enabled) return;
    let logCount = readStored<StudyLog[]>(STUDY_KEYS.log, []).length;
    let doneCount = readStored<StudyTask[]>(STUDY_KEYS.tasks, []).filter(t => t.done).length;
    const onData = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      if (key === STUDY_KEYS.log) {
        const n = readStored<StudyLog[]>(STUDY_KEYS.log, []).length;
        if (n > logCount) { celebrate('Aferin! Bir odak seansı daha 🍅'); boost({ happiness: 10 }); }
        logCount = n;
      }
      if (key === STUDY_KEYS.tasks) {
        const n = readStored<StudyTask[]>(STUDY_KEYS.tasks, []).filter(t => t.done).length;
        if (n > doneCount) { celebrate(pick(['Görev bitti! ✅', 'Süpersin! 🌟', 'Bir tane daha gitti! 💪'])); boost({ happiness: 5 }); }
        doneCount = n;
      }
    };
    window.addEventListener(DATA_EVENT, onData);
    return () => window.removeEventListener(DATA_EVENT, onData);
  }, [stored.enabled, celebrate, boost]);

  // Drag to carry it around; a plain click pets it and opens its card.
  const drag = useRef<{ startX: number; startY: number; offX: number; offY: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, offX: e.clientX - pos.current.x, offY: e.clientY - pos.current.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
      d.moved = true;
      target.current = null;
      setPose('held');
      say(pick(['Wiii! 🎢', 'Nereye gidiyoruz? 👀', 'Uçuyorum! 🪽']), 2000);
    }
    if (d.moved) pos.current = { x: e.clientX - d.offX, y: e.clientY - d.offY };
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) { setPose('idle'); busyUntil.current = Date.now() + 2500; return; }
    target.current = null;
    if (poseRef.current === 'sleep') say('Hmm… 5 dakika daha 😴', 2500);
    else { love(); setPose('happy'); window.setTimeout(() => poseRef.current === 'happy' && setPose('sit'), 900); }
    boost({ happiness: 2 });
    setPanel(open => !open);
  };

  // Keep it still while its card is open.
  useEffect(() => {
    if (panel) busyUntil.current = Number.MAX_SAFE_INTEGER;
    else busyUntil.current = Date.now() + 1500;
  }, [panel]);

  const feed = () => {
    if (coins.balance < FOOD_COST) { say(`Mama ${FOOD_COST} jeton… Biraz çalışıp jeton kazanalım mı? 🍅`); return; }
    setRedemptions(prev => [{ id: uuidv4(), rewardId: 'pet-food', title: `${pet.name} için mama`, emoji: '🐟', cost: FOOD_COST, date: new Date().toISOString() }, ...prev]);
    setPanel(false);
    const spot = randomSpot();
    setBowl(spot);
    goTo({ x: spot.x - size.current.width * 0.55, y: spot.y - size.current.height * 0.55 }, true, () => {
      facing.current = 1;
      setPose('eat');
      busyUntil.current = Date.now() + 3200;
      window.setTimeout(() => {
        setBowl(null);
        boost({ hunger: 35, happiness: 5 });
        celebrate('Mmm, çok lezzetliydi! 😋');
      }, 3000);
    });
  };

  const play = () => {
    setPanel(false);
    const spot = randomSpot();
    setBall(spot);
    goTo({ x: spot.x - size.current.width / 2, y: spot.y - size.current.height / 2 }, true, () => {
      setBall(null);
      boost({ happiness: 12 });
      celebrate(pick(['Yakaladım! 🧶', 'Bir daha! Bir daha! 🎾', 'En sevdiğim oyun 💛']));
    });
  };

  const nap = () => {
    setPanel(false);
    target.current = null;
    setPose('sleep');
    busyUntil.current = Date.now() + 30_000;
  };

  const hide = () => {
    setPanel(false);
    setPet(p => ({ ...p, enabled: false }));
    toast.info(`${pet.name} dinlenmeye gitti. Ayarlar'dan geri çağırabilirsin 🐾`);
  };

  if (!stored.enabled) return null;

  const mood = pet.hunger < 25 ? 'Aç 🥺' : pet.happiness < 30 ? 'Canı sıkkın 😕' : pose === 'sleep' ? 'Uyuyor 😴' : pet.happiness > 75 ? 'Çok mutlu 🥰' : 'Keyfi yerinde 🙂';

  return (
    <>
      {bowl && <span className="fixed z-[54] text-4xl pointer-events-none animate-pop" style={{ left: bowl.x, top: bowl.y }} aria-hidden>🥣</span>}
      {ball && <span className="fixed z-[54] text-3xl pointer-events-none pet-ball" style={{ left: ball.x, top: ball.y }} aria-hidden>🧶</span>}

      <div ref={node} className="fixed left-0 top-0 z-[55] will-change-transform" style={{ width, height }}>
        {bubble && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-56 px-3 py-1.5 rounded-2xl rounded-bl-sm bg-white text-[#3b2f25] border border-black/5 shadow-lg text-xs font-bold animate-pop pointer-events-none">
            {bubble}
          </div>
        )}
        {hearts.map(id => <span key={id} className="pet-heart absolute left-1/2 top-0 text-xl pointer-events-none" aria-hidden>💗</span>)}
        {pose === 'sleep' && <span className="pet-zzz absolute right-0 -top-2 font-hand text-2xl text-ink-soft pointer-events-none" aria-hidden>z z z</span>}
        <button
          type="button"
          aria-label={`${pet.name} — sev, tut ve sürükle`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn('pet block w-full h-full touch-none select-none', `pet-${pose}`, pose === 'held' ? 'cursor-grabbing' : 'cursor-grab')}
        >
          <span className="pet-flip block w-full h-full">
            <PetArt species={pet.species} color={pet.color} pose={pose} traits={activeTraits} />
          </span>
        </button>
      </div>

      {panel && (
        <div className="fixed z-[56] bottom-4 right-4 w-[min(320px,calc(100vw-2rem))] rounded-3xl bg-cream border border-glass/70 shadow-2xl p-4 animate-pop" role="dialog" aria-label={`${pet.name} kartı`}>
          <div className="flex items-start gap-3">
            <span className="text-4xl">{SPECIES[pet.species].emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-xl font-bold text-ink truncate">{pet.name}</p>
              <p className="text-xs font-bold text-ink-muted">{stage.label} · {mood}</p>
            </div>
            <button onClick={() => setPanel(false)} className="p-1.5 rounded-full hover:bg-glass/60 text-ink-soft" aria-label="Kapat"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-2 mt-3">
            <Bar label="🍖 Tokluk" value={pet.hunger} color="#e3a33a" />
            <Bar label="💛 Mutluluk" value={pet.happiness} color="#4caf7a" />
            <div>
              <div className="flex justify-between text-[11px] font-bold text-ink-soft">
                <span>🌱 Büyüme</span>
                <span>{next ? `${next.label} olmasına ${Math.ceil((next.minutes - minutes) / 60)} sa odak` : 'Tam büyüdü 🎉'}</span>
              </div>
              <div className="h-2 rounded-full bg-sand/50 overflow-hidden mt-0.5"><div className="h-full rounded-full bg-moss transition-all" style={{ width: `${toNext * 100}%` }} /></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-4">
            <button onClick={feed} className="btn-ghost flex-col py-2 text-[11px] gap-0.5"><span className="text-xl">🐟</span>Besle<span className="text-[9px] opacity-60">{FOOD_COST}🪙</span></button>
            <button onClick={play} className="btn-ghost flex-col py-2 text-[11px] gap-0.5"><span className="text-xl">🧶</span>Oyna</button>
            <button onClick={nap} className="btn-ghost flex-col py-2 text-[11px] gap-0.5"><span className="text-xl">💤</span>Uyut</button>
            <button onClick={() => setAppearance(a => !a)} className={cn('btn-ghost flex-col py-2 text-[11px] gap-0.5', appearance && 'ring-2 ring-moss/40')}><span className="text-xl">🎨</span>Görünüm</button>
          </div>

          {appearance && (
            <div className="mt-3 space-y-2.5 animate-fade-in">
              <input value={stored.name} onChange={e => setPet(p => ({ ...p, name: e.target.value.slice(0, 16) }))} placeholder="Adı" className="w-full px-3 py-2 glass-input rounded-xl text-ink font-bold text-sm" />
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(SPECIES) as Species[]).map(s => (
                  <button key={s} onClick={() => setPet(p => ({ ...p, species: s }))} className={cn('rounded-xl py-1.5 text-xs font-bold', stored.species === s ? 'bg-moss/15 ring-2 ring-moss/50 text-ink' : 'hover:bg-glass/60 text-ink-soft')}>
                    <span className="block text-xl">{SPECIES[s].emoji}</span>{SPECIES[s].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                {PET_COLORS.map(c => (
                  <button key={c.value} onClick={() => setPet(p => ({ ...p, color: c.value }))} title={c.name} aria-label={c.name}
                    className={cn('w-7 h-7 rounded-full border-2 border-black/10 transition-transform', stored.color === c.value && 'ring-2 ring-moss ring-offset-2 ring-offset-cream scale-110')} style={{ background: c.value }} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted mb-1.5">🧬 Kişiliği · sana benziyor</p>
            <div className="space-y-1 max-h-44 overflow-y-auto custom-scrollbar pr-1">
              {traits.map(t => (
                <div key={t.id} className={cn('flex items-center gap-2 rounded-xl px-2 py-1.5', t.active ? 'bg-moss/10' : 'opacity-70')}>
                  <span className={cn('text-lg', !t.active && 'grayscale')}>{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-ink leading-tight">{t.title} {t.active && <span className="text-moss">✓</span>}</p>
                    <p className="text-[10px] font-semibold text-ink-muted leading-tight">{t.active ? t.look : t.hint}</p>
                    {!t.active && <div className="h-1 rounded-full bg-sand/50 mt-1 overflow-hidden"><div className="h-full bg-moss/60 rounded-full" style={{ width: `${t.progress * 100}%` }} /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-semibold text-ink-muted mt-3">Odaklandıkça büyür, görev bitirdikçe sevinir. Tutup istediğin yere taşıyabilirsin.</p>
          <button onClick={hide} className="text-[11px] font-bold text-ink-muted hover:text-clay mt-1">Şimdilik gizle</button>
        </div>
      )}
    </>
  );
};
