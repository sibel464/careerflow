import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Droplets, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Application } from '../../Interfaces';
import { Plant, speciesFor, STAGE_BY_STATUS, STAGE_LABEL, SPECIES } from './Plant';
import { GrowingTree } from '../GrowingTree';
import { Avatar } from '../Avatar';
import { StatusBadge } from '../StatusBadge';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { useEditor } from '../../Hooks/EditorContext';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { cn } from '../../Utils/classNames';

export const WATER_KEY = 'careerflow_garden_water';

export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';

export const timeOfDay = (hour: number): TimeOfDay =>
  hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'sunset' : 'night';

export const SKY: Record<TimeOfDay, [string, string]> = {
  dawn: ['#f6c9a8', '#b9d4ee'],
  day: ['#8ec5f0', '#d8eefc'],
  sunset: ['#f08a5d', '#7b5ea7'],
  night: ['#0f1a3a', '#2b3a6b'],
};
export const HILL: Record<TimeOfDay, [string, string]> = {
  dawn: ['#9cc58a', '#7fb069'],
  day: ['#a3d18c', '#7fb85f'],
  sunset: ['#8aa66e', '#6b8f55'],
  night: ['#2d4a3a', '#22392d'],
};

const ROW_Y = [338, 412];
const PER_ROW = 8;
const slotX = (i: number) => 175 + (i % PER_ROW) * 100;

// Deterministic "random" so stars and fireflies don't jump around on re-render.
export const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const Butterfly: React.FC<{ i: number; color: string }> = ({ i, color }) => (
  <g className={`garden-butterfly garden-butterfly-${i}`}>
    <g className="garden-wings">
      <ellipse cx="-4" cy="0" rx="5" ry="7" fill={color} opacity="0.9" />
      <ellipse cx="4" cy="0" rx="5" ry="7" fill={color} opacity="0.9" />
    </g>
    <rect x="-0.8" y="-5" width="1.6" height="10" rx="0.8" fill="#2b1d14" />
  </g>
);

/** The living garden: every application is a plant, grown to its stage. */
export const GardenScene: React.FC<{ applications: Application[]; level: number }> = ({ applications, level }) => {
  const { preferences } = usePreferences();
  const { openEditor } = useEditor();
  const [watered, setWatered] = useLocalStorage<string[]>(WATER_KEY, []);
  const [raining, setRaining] = useState(false);
  const [hovered, setHovered] = useState<Application | null>(null);
  const tod = timeOfDay(new Date().getHours());
  const night = tod === 'night';
  const today = format(new Date(), 'yyyy-MM-dd');
  const wateredToday = watered.includes(today);

  const planted = useMemo(
    () => [...applications].sort((a, b) => a.applicationDate.localeCompare(b.applicationDate)).slice(0, PER_ROW * 2),
    [applications]
  );
  const overflow = applications.length - planted.length;

  const water = () => {
    if (wateredToday) return;
    setRaining(true);
    setWatered(prev => [...prev, today]);
    toast.success('Bahçen sulandı! Bitkilerin teşekkür ediyor 🌱');
    window.setTimeout(() => setRaining(false), 3200);
  };

  const [skyTop, skyBottom] = SKY[tod];
  const [hillBack, hillFront] = HILL[tod];
  const sunX = { dawn: 140, day: 500, sunset: 860, night: 820 }[tod];
  const sunY = { dawn: 170, day: 70, sunset: 175, night: 80 }[tod];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-glass/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <svg viewBox="0 0 1000 440" className="w-full h-auto block" role="img" aria-label="Kariyer bahçen">
        <defs>
          <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBottom} />
          </linearGradient>
          <radialGradient id="g-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={night ? '#fdfbf0' : '#fff6c9'} />
            <stop offset="60%" stopColor={night ? '#f2ecd0' : '#ffd666'} />
            <stop offset="100%" stopColor={night ? '#f2ecd0' : '#ffd666'} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1000" height="440" fill="url(#g-sky)" />

        {night && Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={seeded(i) * 1000} cy={seeded(i + 99) * 200} r={seeded(i + 7) * 1.4 + 0.4} fill="#fff" className="garden-star" style={{ animationDelay: `${seeded(i + 3) * 4}s` }} />
        ))}

        {/* Sun or moon */}
        <circle cx={sunX} cy={sunY} r={night ? 46 : 70} fill="url(#g-sun)" />
        <circle cx={sunX} cy={sunY} r={night ? 22 : 30} fill={night ? '#f7f3e3' : '#ffe17a'} />
        {night && <circle cx={sunX + 9} cy={sunY - 6} r={18} fill={skyTop} opacity="0.9" />}

        {/* Clouds */}
        {!night && [0, 1, 2].map(i => (
          <g key={i} className={`garden-cloud garden-cloud-${i}`} opacity={tod === 'day' ? 0.95 : 0.7}>
            <ellipse cx={0} cy={0} rx={46} ry={16} fill="#fff" />
            <ellipse cx={-22} cy={-8} rx={24} ry={16} fill="#fff" />
            <ellipse cx={18} cy={-12} rx={26} ry={18} fill="#fff" />
          </g>
        ))}

        {/* Hills */}
        <path d="M0 250 Q180 165 400 228 T780 205 T1000 220 L1000 440 L0 440Z" fill={hillBack} />

        {/* Your career tree grows on the hill as you level up */}
        <GrowingTree level={level} bare x={790} y={60} width={220} height={220} />

        <path d="M0 292 Q500 255 1000 288 L1000 440 L0 440Z" fill={hillFront} />

        {/* Fence */}
        <g fill="#d9b88f" stroke="#a88560" strokeWidth="1">
          <rect x="20" y="268" width="960" height="5" rx="2" />
          <rect x="20" y="282" width="960" height="5" rx="2" />
          {Array.from({ length: 25 }, (_, i) => <path key={i} d={`M${28 + i * 39} 296 v-36 l5 -6 l5 6 v36z`} />)}
        </g>

        {/* Soil beds */}
        {ROW_Y.map(y => (
          <g key={y}>
            <rect x="110" y={y - 14} width="860" height="30" rx="15" fill="#6b4630" />
            <rect x="110" y={y - 14} width="860" height="8" rx="4" fill="#7d5538" />
          </g>
        ))}

        {/* Plants */}
        {planted.map((app, i) => (
          <g
            key={app.id}
            transform={`translate(${slotX(i)} ${ROW_Y[Math.floor(i / PER_ROW)]})`}
            onMouseEnter={() => setHovered(app)}
            onMouseLeave={() => setHovered(h => (h?.id === app.id ? null : h))}
            onClick={() => openEditor(app)}
            className="cursor-pointer garden-plant-hit"
            role="button"
            aria-label={`${app.companyName}: ${STAGE_LABEL[STAGE_BY_STATUS[app.status]]}`}
          >
            <rect x="-40" y="-90" width="80" height="120" fill="transparent" />
            <Plant species={speciesFor(app.companyName)} stage={STAGE_BY_STATUS[app.status]} label={app.companyName} delay={i * 0.7} />
          </g>
        ))}

        {applications.length === 0 && (
          <text x="540" y="380" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fdfbf7" fontFamily="Lora, serif">
            Bahçen ilk tohumunu bekliyor 🌱
          </text>
        )}

        {/* Butterflies by day, fireflies by night */}
        {!night && ['#f4b8c8', '#fde9b8', '#c9d8f2'].map((c, i) => <Butterfly key={i} i={i} color={c} />)}
        {night && Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={120 + seeded(i + 40) * 860} cy={250 + seeded(i + 80) * 170} r="2.4" fill="#f7f39a" className="garden-firefly" style={{ animationDelay: `${seeded(i) * 3}s` }} />
        ))}

        {/* Watering rain */}
        {raining && Array.from({ length: 70 }, (_, i) => (
          <line key={i} x1={110 + seeded(i + 200) * 860} y1={-20} x2={106 + seeded(i + 200) * 860} y2={-4}
            stroke="#8ec5f0" strokeWidth="2" strokeLinecap="round" className="garden-rain" style={{ animationDelay: `${seeded(i + 5) * 0.8}s` }} />
        ))}
      </svg>

      {/* Your character tends the garden */}
      <div className={`absolute left-[1%] bottom-[3%] w-[10%] min-w-14 pointer-events-none ${raining ? 'companion-wave' : 'companion-idle'}`}>
        <Avatar config={preferences.look} transparent className="w-full h-auto drop-shadow-lg" />
        {raining && <span className="absolute -right-2 top-1/3 text-2xl animate-bounce">🚿</span>}
      </div>

      {/* Info strip */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-cream/85 backdrop-blur-md border border-glass/70 shadow-md max-w-sm">
          {hovered ? (
            <div className="animate-fade-in">
              <p className="text-sm font-bold text-ink">
                {SPECIES.find(s => s.id === speciesFor(hovered.companyName))?.emoji} {hovered.companyName}
                <span className="text-ink-muted font-semibold"> · {STAGE_LABEL[STAGE_BY_STATUS[hovered.status]]}</span>
              </p>
              <p className="text-xs font-semibold text-ink-soft mt-0.5 flex items-center gap-2">{hovered.position} <StatusBadge status={hovered.status} className="py-0.5 px-2 text-[10px]" /></p>
            </div>
          ) : (
            <p className="text-xs font-bold text-ink-soft">
              {applications.length ? `${applications.length} bitki · bir bitkinin üstüne gel ya da tıkla 🌿` : 'Her başvuru bahçende bir tohum olur 🌰'}
              {overflow > 0 && ` · +${overflow} tohum serada`}
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex gap-2">
          {applications.length === 0 && (
            <button onClick={() => openEditor(null)} className="btn-primary px-4 py-2.5 text-sm"><Plus className="w-4 h-4 mr-1.5" /> İlk tohumu ek</button>
          )}
          <button
            onClick={water}
            disabled={wateredToday}
            className={cn('px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-md transition-all',
              wateredToday ? 'bg-cream/85 text-ink-muted cursor-default' : 'bg-[#4f86c0] text-white hover:scale-105 active:scale-95')}
          >
            <Droplets className={cn('w-4 h-4', raining && 'animate-bounce')} />
            {wateredToday ? 'Bugün sulandı ✓' : 'Bahçeyi sula'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 right-3 hidden md:flex gap-1.5 text-[10px] font-black pointer-events-none">
        {[['🌰', 'Başvuruldu'], ['🌱', 'Mülakat bekleniyor'], ['🌿', 'Görüşüldü'], ['🌸', 'Kabul'], ['🍂', 'Ret']].map(([e, l]) => (
          <span key={l} className="px-2 py-1 rounded-lg bg-cream/80 text-ink-soft backdrop-blur">{e} {l}</span>
        ))}
      </div>
    </div>
  );
};
