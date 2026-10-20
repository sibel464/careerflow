import React from 'react';
import { cn } from '../Utils/classNames';
import type { TimerStyle } from '../Utils/timer';
import { ClockTimer } from './Focus/DeskProps';


interface Props { style: TimerStyle; progress: number; running: boolean; focus: boolean; className?: string }

/** The physical timer sitting on the desk. `progress` goes 0 → 1 over the session. */
export const TimerFace: React.FC<Props> = ({ style, progress, running, focus, className }) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const sand = focus ? '#e2b36b' : '#8fc7a8';

  if (style === 'hourglass') {
    // Top bulb empties from the top; bottom fills as a mound.
    const topLevel = 22 + p * 100; // y where the top sand surface sits
    const bottomH = p * 88;
    return (
      <svg viewBox="0 0 160 260" className={cn('overflow-visible', className)} role="img" aria-label={`Kum saati, %${Math.round(p * 100)}`}>
        <defs>
          <clipPath id="hg-top"><path d="M34 22 L126 22 Q126 86 86 122 L74 122 Q34 86 34 22 Z" /></clipPath>
          <clipPath id="hg-bottom"><path d="M74 138 L86 138 Q126 174 126 238 L34 238 Q34 174 74 138 Z" /></clipPath>
          <linearGradient id="hg-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--wood-hi)" /><stop offset="1" stopColor="var(--wood-lo)" /></linearGradient>
        </defs>
        {/* Glass */}
        <path d="M34 22 L126 22 Q126 86 86 122 L86 138 Q126 174 126 238 L34 238 Q34 174 74 138 L74 122 Q34 86 34 22 Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
        {/* Sand */}
        <g clipPath="url(#hg-top)"><rect x="30" y={topLevel} width="100" height="130" fill={sand} style={{ transition: 'y 1s linear' }} /></g>
        <g clipPath="url(#hg-bottom)">
          <path d={`M30 240 L30 ${240 - bottomH * 0.55} Q80 ${240 - bottomH * 1.15} 130 ${240 - bottomH * 0.55} L130 240 Z`} fill={sand} style={{ transition: 'd 1s linear' }} />
        </g>
        {running && p < 1 && <line x1="80" y1="122" x2="80" y2={236 - bottomH * 0.9} stroke={sand} strokeWidth="2.2" className="hg-stream" />}
        <path d="M44 34 Q46 70 66 96" stroke="white" strokeOpacity="0.7" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Wooden frame */}
        <rect x="18" y="8" width="124" height="16" rx="5" fill="url(#hg-wood)" />
        <rect x="18" y="236" width="124" height="16" rx="5" fill="url(#hg-wood)" />
        <rect x="22" y="22" width="7" height="216" rx="3" fill="url(#hg-wood)" />
        <rect x="131" y="22" width="7" height="216" rx="3" fill="url(#hg-wood)" />
      </svg>
    );
  }

  if (style === 'tomato') {
    const angle = p * 360;
    return (
      <svg viewBox="0 0 200 200" className={cn('overflow-visible', className)} role="img" aria-label={`Domates zamanlayıcı, %${Math.round(p * 100)}`}>
        <defs>
          <radialGradient id="tm-body" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#ff8a73" /><stop offset="0.55" stopColor="#e2483a" /><stop offset="1" stopColor="#a8261d" /></radialGradient>
        </defs>
        <ellipse cx="100" cy="186" rx="70" ry="9" fill="rgba(0,0,0,0.18)" />
        <g style={{ transform: `rotate(${-angle}deg)`, transformOrigin: '100px 108px', transition: 'transform 1s linear' }}>
          <ellipse cx="100" cy="108" rx="82" ry="74" fill="url(#tm-body)" />
          {/* Dial band */}
          <path d="M22 116 Q100 140 178 116 L178 100 Q100 124 22 100 Z" fill="#fff4ea" opacity="0.95" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x = 100 + Math.sin(a) * 76;
            return Math.cos(a) > 0 ? <line key={i} x1={x} x2={x} y1={107 + (i % 4 ? 3 : 0)} y2={118} stroke="#a8261d" strokeWidth={i % 4 ? 1 : 2} /> : null;
          })}
        </g>
        {/* Leaf and stem stay upright */}
        <path d="M100 38 C 88 30, 74 34, 66 42 C 80 42, 88 46, 100 44 C 112 46, 120 42, 134 42 C 126 34, 112 30, 100 38 Z" fill="#3f8a4a" />
        <path d="M100 40 Q 98 28 104 20" stroke="#2f6b37" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Fixed pointer */}
        <path d="M100 92 L94 80 L106 80 Z" fill="#2c2a30" />
        <ellipse cx="72" cy="78" rx="16" ry="9" fill="white" opacity="0.35" transform="rotate(-25 72 78)" />
        {running && <circle cx="100" cy="108" r="86" fill="none" stroke="#e2483a" strokeOpacity="0.25" strokeWidth="3" className="tm-tick" />}
      </svg>
    );
  }

  return <ClockTimer progress={p} focus={focus} running={running} className={className} />;
};
