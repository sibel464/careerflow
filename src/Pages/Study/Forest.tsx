import React, { useEffect, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Droplets, Play, TreePine, Clock, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStudy } from '../../Hooks/useStudy';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { Avatar } from '../../Components/Avatar';
import { ForestTree, Sapling } from '../../Components/Garden/ForestTree';
import { timeOfDay, SKY, HILL, seeded } from '../../Components/Garden/GardenScene';
import {
  forestProgress, saplingStage, TREE_KINDS, TreeKind, ForestState, DEFAULT_FOREST, FOREST_KEY, FOREST_WATER_KEY, MINUTES_PER_TREE, WATER_BONUS,
} from '../../Utils/forest';
import { formatMinutes } from '../../Utils/study';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';

/** Hand-placed spots so the first trees form a pleasant grove around the sapling. */
const FEATURED: [number, number, number][] = [
  [380, 372, 0.95], [735, 368, 0.95], [250, 330, 0.78], [860, 330, 0.8], [470, 318, 0.7], [640, 314, 0.7],
  [130, 300, 0.66], [960, 298, 0.62], [330, 292, 0.6], [790, 290, 0.6], [560, 286, 0.56], [60, 380, 1],
];

/** Where tree number i stands. After the grove fills, trees spread across the back hills. */
const slot = (i: number) => {
  if (i < FEATURED.length) {
    const [x, y, scale] = FEATURED[i];
    return { x, y, scale };
  }
  const k = i - FEATURED.length;
  const row = Math.floor(k / 12);
  const col = k % 12;
  return {
    x: 30 + col * 85 + (row % 2 ? 40 : 0) + (seeded(i + 3) - 0.5) * 24,
    y: 268 - Math.min(row, 3) * 10 + (seeded(i + 11) - 0.5) * 8,
    scale: 0.5 - Math.min(row, 3) * 0.06,
  };
};

/** Small details that make the ground feel alive. */
const Ground: React.FC<{ night: boolean }> = ({ night }) => {
  const dim = night ? 0.55 : 1;
  const c = (hex: string) => (night ? `color-mix(in srgb, ${hex} ${dim * 100}%, #0b1426)` : hex);
  return (
    <g>
      {/* Distant tree line */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = i * 31 + (seeded(i + 70) - 0.5) * 12;
        const h = 18 + seeded(i + 90) * 16;
        const y = 236 - Math.sin((x / 1000) * Math.PI * 2.2) * 14;
        return i % 3 === 0
          ? <circle key={i} cx={x} cy={y - h / 2} r={h / 2} fill={c('#5f9a5a')} opacity="0.55" />
          : <path key={i} d={`M${x - 9} ${y} L${x} ${y - h - 8} L${x + 9} ${y}Z`} fill={c('#4f8a52')} opacity="0.55" />;
      })}
      {/* Path to the sapling */}
      <path d="M520 470 Q540 445 548 432 Q556 420 560 418 Q566 420 574 432 Q584 448 610 470Z" fill={c('#d9c08f')} opacity="0.75" />
      {/* Bushes */}
      {[[60, 420, 1], [940, 425, 1.1], [205, 452, 0.8], [820, 452, 0.85], [690, 440, 0.6]].map(([x, y, s], i) => (
        <g key={`b${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <circle cx="-14" cy="-10" r="16" fill={c('#4a9150')} /><circle cx="10" cy="-14" r="19" fill={c('#5aa35c')} /><circle cx="26" cy="-6" r="13" fill={c('#4a9150')} />
          {!night && i % 2 === 0 && <><circle cx="0" cy="-22" r="3" fill="#f4b8c8" /><circle cx="18" cy="-12" r="3" fill="#fde9b8" /></>}
        </g>
      ))}
      {/* Grass tufts, flowers and pebbles */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = seeded(i + 300) * 1000;
        const y = 330 + seeded(i + 400) * 135;
        const kind = i % 5;
        if (kind === 0 && !night) {
          const petal = ['#f4b8c8', '#fde9b8', '#ffffff', '#c9d8f2'][i % 4];
          return <g key={`f${i}`}><line x1={x} y1={y} x2={x} y2={y - 7} stroke={c('#4f8a3a')} strokeWidth="1.5" /><circle cx={x} cy={y - 8} r="2.6" fill={petal} /></g>;
        }
        if (kind === 1) return <ellipse key={`r${i}`} cx={x} cy={y} rx="5" ry="3" fill={c('#b9b2a5')} />;
        return <path key={`g${i}`} d={`M${x} ${y} q-2 -7 -5 -9 M${x} ${y} q0 -8 1 -11 M${x} ${y} q3 -6 6 -8`} stroke={c('#4f8a3a')} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Forest: React.FC = () => {
  const navigate = useNavigate();
  const { log } = useStudy();
  const { preferences } = usePreferences();
  const [watered, setWatered] = useLocalStorage<string[]>(FOREST_WATER_KEY, []);
  const [forest, setForest] = useLocalStorage<ForestState>(FOREST_KEY, DEFAULT_FOREST);
  const [raining, setRaining] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  const progress = forestProgress(log, watered);
  const stage = saplingStage(progress.fraction);
  const tod = timeOfDay(new Date().getHours());
  const night = tod === 'night';

  // A tree that just finished growing keeps the kind that was chosen for it.
  useEffect(() => {
    if (progress.trees.length > forest.kinds.length) {
      const added = progress.trees.length - forest.kinds.length;
      // First visit with existing history: give the backlog a mixed forest instead of identical trees.
      setForest(f => ({
        ...f,
        kinds: [...f.kinds, ...(f.kinds.length === 0 && added > 1
          ? Array.from({ length: added }, (_, i) => TREE_KINDS[i % TREE_KINDS.length].id)
          : Array(added).fill(f.nextKind))],
      }));
      if (forest.kinds.length > 0 || added === 1) {
        if (preferences.celebrate) fireConfetti(120);
        toast.success('Yeni bir ağaç büyüdü! Ormanın genişliyor 🌳');
      }
    }
  }, [progress.trees.length, forest.kinds.length, setForest, preferences.celebrate]);

  const water = () => {
    if (watered.includes(today)) return;
    setRaining(true);
    setWatered(prev => [...prev, today]);
    toast.success(`Fidanın sulandı! +${WATER_BONUS} dk büyüme 💧`);
    window.setTimeout(() => setRaining(false), 3200);
  };

  const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const thisWeek = progress.trees.filter(t => t.date >= weekAgo).length;
  const totalFocus = log.reduce((s, l) => s + l.minutes, 0);
  const left = MINUTES_PER_TREE - progress.current;
  const [skyTop, skyBottom] = SKY[tod];
  const [hillBack, hillFront] = HILL[tod];
  const nextKind = forest.nextKind;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Ormanım 🌲</h1>
          <p className="text-ink-soft mt-2">Her 5 saat odak bir ağaç büyütür. Çalıştıkça ormanın genişler, fidanını sulamayı unutma.</p>
        </div>
        <button onClick={() => navigate('/study/focus')} className="btn-primary px-5 py-3 text-sm w-fit"><Play className="w-4 h-4 mr-2" /> Odaklan, büyüt</button>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-glass/70 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <svg viewBox="0 0 1000 470" className="w-full h-auto block" role="img" aria-label={`Ormanın: ${progress.trees.length} ağaç`}>
          <defs>
            <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyTop} /><stop offset="100%" stopColor={skyBottom} />
            </linearGradient>
          </defs>
          <rect width="1000" height="470" fill="url(#f-sky)" />
          {night && Array.from({ length: 50 }, (_, i) => (
            <circle key={i} cx={seeded(i) * 1000} cy={seeded(i + 50) * 190} r={seeded(i + 9) * 1.4 + 0.4} fill="#fff" className="garden-star" style={{ animationDelay: `${seeded(i + 2) * 4}s` }} />
          ))}
          <circle cx={night ? 830 : 160} cy={night ? 80 : 90} r={night ? 24 : 34} fill={night ? '#f7f3e3' : '#ffe17a'} />
          {!night && [0, 1, 2].map(i => (
            <g key={i} className={`garden-cloud garden-cloud-${i}`} opacity="0.9">
              <ellipse rx="46" ry="16" fill="#fff" /><ellipse cx="-22" cy="-8" rx="24" ry="16" fill="#fff" /><ellipse cx="18" cy="-12" rx="26" ry="18" fill="#fff" />
            </g>
          ))}
          <path d="M0 250 Q160 170 360 225 T720 200 T1000 215 L1000 470 L0 470Z" fill={hillBack} />
          <path d="M0 300 Q500 255 1000 295 L1000 470 L0 470Z" fill={hillFront} />
          <Ground night={night} />

          {/* Grown trees, back rows first so nearer ones overlap them */}
          {progress.trees.map((t, i) => ({ t, i, ...slot(i) }))
            .sort((a, b) => a.y - b.y)
            .map(({ t, i, x, y, scale }) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${scale})`} className="forest-tree-in" style={{ animationDelay: `${Math.min(i, 20) * 0.04}s` }}>
                <title>{`${TREE_KINDS.find(k => k.id === (forest.kinds[i] ?? 'oak'))?.name} · ${format(parseISO(t.date), 'd MMMM yyyy', { locale: tr })}'de büyüdü`}</title>
                <ellipse cx="0" cy="2" rx="26" ry="6" fill="rgba(0,0,0,0.12)" />
                <g className="plant-sway" style={{ animationDelay: `${-seeded(i) * 5}s` }}>
                  <ForestTree kind={forest.kinds[i] ?? 'oak'} night={night} />
                </g>
              </g>
            ))}

          {/* The sapling you're growing */}
          <g transform="translate(560 440)">
            <ellipse cx="0" cy="4" rx="46" ry="11" fill="#5c3a24" />
            <ellipse cx="0" cy="1" rx="40" ry="7" fill="#7d5538" />
            <g className="plant-sway"><g transform="scale(1.25)"><Sapling fraction={progress.fraction} kind={nextKind} /></g></g>
          </g>

          {night && Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={60 + seeded(i + 30) * 880} cy={250 + seeded(i + 60) * 190} r="2.4" fill="#f7f39a" className="garden-firefly" style={{ animationDelay: `${seeded(i) * 3}s` }} />
          ))}
          {raining && Array.from({ length: 50 }, (_, i) => (
            <line key={i} x1={440 + seeded(i + 200) * 240} y1={-20} x2={437 + seeded(i + 200) * 240} y2={-5}
              stroke="#8ec5f0" strokeWidth="2" strokeLinecap="round" className="garden-rain" style={{ animationDelay: `${seeded(i + 5) * 0.8}s` }} />
          ))}
        </svg>

        <div className={cn('absolute bottom-[2%] left-[64%] w-[9%] min-w-12 pointer-events-none', raining ? 'companion-wave' : 'companion-idle')}>
          <Avatar config={preferences.look} transparent className="w-full h-auto drop-shadow-lg" />
        </div>

        {progress.trees.length === 0 && (
          <div className="absolute top-[30%] inset-x-0 text-center pointer-events-none">
            <p className="inline-block px-4 py-2 rounded-2xl bg-cream/85 backdrop-blur font-bold text-ink shadow">İlk ağacın 5 saatlik odakla büyüyecek 🌱</p>
          </div>
        )}

        {/* Sapling card */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 p-4 rounded-2xl bg-cream/90 backdrop-blur-md border border-glass/70 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="23" fill="none" strokeWidth="6" className="stroke-sand/60" />
                <circle cx="28" cy="28" r="23" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-moss transition-all duration-1000"
                  strokeDasharray={2 * Math.PI * 23} strokeDashoffset={2 * Math.PI * 23 * (1 - progress.fraction)} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl">{stage.emoji}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-moss">Sıradaki ağacın · {stage.name}</p>
              <p className="text-sm font-bold text-ink">%{Math.round(progress.fraction * 100)} büyüdü</p>
              <p className="text-xs font-semibold text-ink-muted">Sıradaki ağaca {formatMinutes(left)} odak</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted mb-1.5">Bu fidan ne olsun?</p>
            <div className="flex gap-1">
              {TREE_KINDS.map(k => (
                <button key={k.id} onClick={() => setForest(f => ({ ...f, nextKind: k.id as TreeKind }))} title={k.name} aria-label={k.name} aria-pressed={nextKind === k.id}
                  className={cn('flex-1 flex flex-col items-center pt-1 pb-0.5 rounded-xl transition-all', nextKind === k.id ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>
                  <svg viewBox="-45 -125 90 128" className="w-8 h-9" aria-hidden="true"><ForestTree kind={k.id as TreeKind} /></svg>
                  <span className={cn('text-[9px] font-black', nextKind === k.id ? 'text-moss' : 'text-ink-muted')}>{k.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={water} disabled={watered.includes(today)}
            className={cn('mt-3 w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all',
              watered.includes(today) ? 'bg-glass/60 text-ink-muted' : 'bg-[#4f86c0] text-white hover:brightness-110 active:scale-95')}>
            <Droplets className={cn('w-4 h-4', raining && 'animate-bounce')} />
            {watered.includes(today) ? 'Bugün sulandı ✓' : `Sula (+${WATER_BONUS} dk)`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TreePine, label: 'Ağaç', value: progress.trees.length, tone: 'text-moss' },
          { icon: Clock, label: 'Toplam odak', value: formatMinutes(totalFocus), tone: 'text-clay' },
          { icon: Sprout, label: 'Bu hafta büyüyen', value: thisWeek, tone: 'text-[#3a9a6e]' },
          { icon: Droplets, label: 'Sulama günü', value: watered.length, tone: 'text-[#4f86c0]' },
        ].map(s => (
          <div key={s.label} className="glass-panel p-5">
            <s.icon className={cn('w-5 h-5 mb-2', s.tone)} />
            <p className="text-2xl font-black text-ink">{s.value}</p>
            <p className="text-xs font-bold text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
