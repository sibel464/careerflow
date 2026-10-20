import React from 'react';
import { cn } from '../../Utils/classNames';

/** A twin-bell alarm clock whose colored wedge shrinks as the session runs (like a Time Timer). */
export const ClockTimer: React.FC<{ progress: number; focus: boolean; running?: boolean; className?: string }> = ({ progress, focus, running, className }) => {
  const left = 1 - Math.min(Math.max(progress, 0), 1);
  const a = left * 360;
  const r = 62;
  const rad = ((a - 90) * Math.PI) / 180;
  const end = { x: 100 + r * Math.cos(rad), y: 112 + r * Math.sin(rad) };
  const wedge = a >= 359.5
    ? <circle cx="100" cy="112" r={r} />
    : a <= 0.5 ? null
    : <path d={`M100 112 L100 ${112 - r} A${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`} />;
  const color = focus ? '#d9483b' : '#4f9a72';
  return (
    <svg viewBox="0 0 200 200" className={cn('overflow-visible', running && 'clock-tick', className)} role="img" aria-label={`Çalar saat, kalan %${Math.round(left * 100)}`}>
      <defs>
        <radialGradient id="ck-metal" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fdfdfd" /><stop offset="0.5" stopColor="#c9ccd1" /><stop offset="1" stopColor="#7d838c" /></radialGradient>
        <radialGradient id="ck-body" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor={focus ? '#ff8f7d' : '#8fd1ad'} /><stop offset="0.6" stopColor={color} /><stop offset="1" stopColor={focus ? '#8f2318' : '#2f6b4c'} /></radialGradient>
      </defs>
      <ellipse cx="100" cy="194" rx="62" ry="6" fill="rgba(0,0,0,0.2)" />
      {/* Legs */}
      <path d="M58 166 L44 192" stroke="#5b6068" strokeWidth="7" strokeLinecap="round" />
      <path d="M142 166 L156 192" stroke="#5b6068" strokeWidth="7" strokeLinecap="round" />
      {/* Bells, hammer and handle */}
      <path d="M62 26 Q100 4 138 26" stroke="#7d838c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g className={running ? 'clock-bells' : undefined}>
        <path d="M30 56 A30 30 0 0 1 76 22 Z" fill="url(#ck-metal)" stroke="#6b7078" strokeWidth="1.5" />
        <path d="M124 22 A30 30 0 0 1 170 56 Z" fill="url(#ck-metal)" stroke="#6b7078" strokeWidth="1.5" />
      </g>
      <rect x="96" y="30" width="8" height="18" rx="3" fill="#6b7078" />
      {/* Body and face */}
      <circle cx="100" cy="112" r="84" fill="url(#ck-body)" />
      <circle cx="100" cy="112" r="74" fill="#7d838c" />
      <circle cx="100" cy="112" r="71" fill="#fbf6ec" />
      <g fill={color} opacity="0.88">{wedge}</g>
      {Array.from({ length: 60 }, (_, i) => {
        const t = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        return <line key={i} x1={100 + Math.sin(t) * (long ? 58 : 63)} y1={112 - Math.cos(t) * (long ? 58 : 63)} x2={100 + Math.sin(t) * 68} y2={112 - Math.cos(t) * 68} stroke="#3b2f2a" strokeWidth={long ? 2.2 : 0.9} strokeLinecap="round" />;
      })}
      {/* Hand at the wedge edge */}
      <line x1="100" y1="112" x2={100 + 56 * Math.cos(rad)} y2={112 + 56 * Math.sin(rad)} stroke="#2b2420" strokeWidth="3.4" strokeLinecap="round" style={{ transition: 'all 1s linear' }} />
      <circle cx="100" cy="112" r="7" fill="url(#ck-metal)" stroke="#5b6068" />
      {/* Glass shine */}
      <path d="M52 78 A58 58 0 0 1 104 50" stroke="white" strokeOpacity="0.7" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** An articulated desk lamp; when on, it pours warm light over the desk. */
export const DeskLamp: React.FC<{ on: boolean; className?: string }> = ({ on, className }) => (
  <svg viewBox="0 0 120 170" className={cn('overflow-visible', className)} aria-hidden>
    <defs>
      <linearGradient id="lp-metal" x1="0" x2="1"><stop offset="0" stopColor="#3d4f5c" /><stop offset="0.5" stopColor="#5f7686" /><stop offset="1" stopColor="#32414c" /></linearGradient>
    </defs>
    <ellipse cx="34" cy="164" rx="30" ry="5" fill="rgba(0,0,0,0.22)" />
    <path d="M8 160 Q 34 150 60 160 L 60 165 L 8 165 Z" fill="url(#lp-metal)" />
    <path d="M34 156 L 22 92 L 74 46" stroke="url(#lp-metal)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 154 L 18 92" stroke="#8aa0ae" strokeWidth="1" opacity="0.6" />
    <circle cx="22" cy="92" r="6" fill="#4b5f6d" stroke="#2b3a44" />
    <circle cx="74" cy="46" r="5" fill="#4b5f6d" stroke="#2b3a44" />
    {/* Shade */}
    <path d="M66 36 L 108 28 L 116 70 Q 98 76 80 68 Z" fill="url(#lp-metal)" stroke="#26333c" strokeWidth="1" />
    <ellipse cx="98" cy="70" rx="18" ry="5" transform="rotate(-14 98 70)" fill={on ? '#fff3c4' : '#2b3a44'} />
    {on && <ellipse cx="98" cy="70" rx="14" ry="3" transform="rotate(-14 98 70)" fill="#fff" />}
  </svg>
);

/** A ceramic mug; it steams while you focus. */
export const Mug: React.FC<{ steaming: boolean; className?: string }> = ({ steaming, className }) => (
  <svg viewBox="0 0 80 90" className={cn('overflow-visible', className)} aria-hidden>
    <defs>
      <linearGradient id="mg-body" x1="0" x2="1"><stop offset="0" stopColor="color-mix(in srgb, var(--color-clay) 70%, white)" /><stop offset="0.55" stopColor="var(--color-clay)" /><stop offset="1" stopColor="color-mix(in srgb, var(--color-clay) 70%, black)" /></linearGradient>
    </defs>
    {steaming && (
      <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75">
        <path className="mug-steam" d="M24 22 q-6 -8 0 -16 q6 -8 0 -16" />
        <path className="mug-steam [animation-delay:0.9s]" d="M36 22 q-6 -8 0 -16 q6 -8 0 -16" />
        <path className="mug-steam [animation-delay:1.8s]" d="M48 22 q-6 -8 0 -16 q6 -8 0 -16" />
      </g>
    )}
    <ellipse cx="36" cy="86" rx="30" ry="4" fill="rgba(0,0,0,0.2)" />
    <path d="M62 38 q16 2 14 18 q-2 14 -16 14" stroke="url(#mg-body)" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M8 28 L 64 28 L 60 80 Q 36 88 12 80 Z" fill="url(#mg-body)" />
    <ellipse cx="36" cy="28" rx="28" ry="7" fill="color-mix(in srgb, var(--color-clay) 75%, black)" />
    <ellipse cx="36" cy="29" rx="24" ry="5" fill="#5a3a26" />
    <ellipse cx="30" cy="28" rx="8" ry="1.6" fill="#8a5a3b" opacity="0.6" />
    <path d="M16 36 Q 14 58 18 74" stroke="white" strokeOpacity="0.35" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

/** A trailing pothos in a terracotta pot. */
export const PottedPlant: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 110 130" className={cn('overflow-visible', className)} aria-hidden>
    <ellipse cx="55" cy="126" rx="34" ry="4" fill="rgba(0,0,0,0.2)" />
    <g className="plant-sway" style={{ transformOrigin: '55px 82px' }}>
      {[[-40, 20, 26], [-15, 6, 30], [10, 0, 32], [35, 14, 28], [60, 30, 22], [-62, 38, 22]].map(([rot, dy, len], i) => (
        <g key={i} transform={`rotate(${rot} 55 82)`}>
          <path d={`M55 82 Q 52 ${66 - dy / 3} 55 ${82 - len - dy}`} stroke="#4c7a43" strokeWidth="2" fill="none" />
          <path d={`M55 ${82 - len - dy} c -10 -4 -12 -16 0 -22 c 12 6 10 18 0 22 z`} fill={i % 2 ? '#6aa356' : '#4f8f45'} />
          <path d={`M55 ${82 - len - dy} l0 -18`} stroke="#9fd18a" strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
    </g>
    <path d="M24 80 L 86 80 L 80 124 L 30 124 Z" fill="#c9714a" />
    <rect x="20" y="74" width="70" height="12" rx="3" fill="#d9825a" />
    <path d="M30 90 Q 32 108 34 120" stroke="white" strokeOpacity="0.25" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

/** A flip clock: each digit sits on its own little card that flips when it changes. */
export const FlipClock: React.FC<{ text: string; large?: boolean }> = ({ text, large }) => (
  <div className={cn('inline-flex items-center gap-1.5 p-2 rounded-2xl bg-[#2a2420] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]', large && 'gap-2 p-3')} aria-label={text}>
    {text.split('').map((ch, i) => ch === ':' ? (
      <span key={i} className={cn('flex flex-col gap-2 px-0.5', large && 'gap-3')} aria-hidden>
        <span className="w-2 h-2 rounded-full bg-[#f3ead9]" /><span className="w-2 h-2 rounded-full bg-[#f3ead9]" />
      </span>
    ) : (
      <span key={`${i}-${ch}`} className={cn('flip-card relative flex items-center justify-center rounded-lg bg-gradient-to-b from-[#3d3530] to-[#2f2824] font-black tabular-nums text-[#f6efe2] shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]',
        large ? 'w-20 h-28 text-7xl' : 'w-12 h-16 sm:w-14 sm:h-20 text-4xl sm:text-5xl')} aria-hidden>
        {ch}
        <span className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
        <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-sm bg-[#8d939b]" />
        <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-sm bg-[#8d939b]" />
      </span>
    ))}
  </div>
);
