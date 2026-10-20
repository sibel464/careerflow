import React from 'react';
import type { Sky } from '../../Utils/weather';
import { cn } from '../../Utils/classNames';

const INK = '#4a3326';

/** A little kawaii face: happy, sleepy, or worried. */
const Face: React.FC<{ x: number; y: number; mood?: 'happy' | 'sleepy' | 'worried'; s?: number }> = ({ x, y, mood = 'happy', s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {mood === 'sleepy'
      ? <path d="M-7 0 q2.5 2 5 0 M2 0 q2.5 2 5 0" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      : <><circle cx="-4.5" cy="0" r="1.6" fill={INK} /><circle cx="4.5" cy="0" r="1.6" fill={INK} /><circle cx="-4" cy="-0.6" r="0.5" fill="white" /><circle cx="5" cy="-0.6" r="0.5" fill="white" /></>}
    {mood === 'worried'
      ? <path d="M-2.2 5 q2.2 -2 4.4 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      : <path d="M-2.2 3.6 q2.2 2.2 4.4 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />}
    <ellipse cx="-8" cy="3" rx="2.2" ry="1.3" fill="#ff8fa3" opacity="0.6" />
    <ellipse cx="8" cy="3" rx="2.2" ry="1.3" fill="#ff8fa3" opacity="0.6" />
  </g>
);

const Cloud: React.FC<{ x?: number; y?: number; fill?: string; s?: number }> = ({ x = 0, y = 0, fill = '#ffffff', s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M14 42 C 6 42, 4 32, 11 29 C 10 19, 22 15, 27 22 C 30 13, 45 13, 47 24 C 56 23, 59 34, 52 38 C 52 41, 49 42, 46 42 Z"
    fill={fill} stroke="#c9ced8" strokeWidth="1.4" strokeLinejoin="round" />
);

/** Cute weather pictures with little faces; `night` swaps the sun for a sleepy moon. */
export const CuteWeatherIcon: React.FC<{ sky: Sky; night?: boolean; className?: string }> = ({ sky, night, className }) => (
  <svg viewBox="0 0 64 64" className={cn('overflow-visible', className)} aria-hidden>
    {(sky === 'clear' || sky === 'partly') && (night ? (
      <g className="wx-float">
        <path d="M38 10 A20 20 0 1 0 54 40 A16 16 0 1 1 38 10Z" fill="#ffe08a" stroke="#e8b84a" strokeWidth="1.4" />
        <Face x={30} y={33} mood="sleepy" />
        <path d="M52 12 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1z M12 14 l0.7 1.6 1.6 0.7 -1.6 0.7 -0.7 1.6 -0.7 -1.6 -1.6 -0.7 1.6 -0.7z" fill="#ffe08a" />
      </g>
    ) : (
      <g className={sky === 'clear' ? 'wx-spin-rays' : undefined}>
        <g stroke="#f6b73c" strokeWidth="3" strokeLinecap="round" className="wx-rays" style={{ transformOrigin: sky === 'clear' ? '32px 32px' : '24px 24px' }}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2; const cx = sky === 'clear' ? 32 : 24; const cy = sky === 'clear' ? 32 : 24; const r = sky === 'clear' ? 17 : 13;
            return <line key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r} x2={cx + Math.cos(a) * (r + 6)} y2={cy + Math.sin(a) * (r + 6)} />;
          })}
        </g>
        <circle cx={sky === 'clear' ? 32 : 24} cy={sky === 'clear' ? 32 : 24} r={sky === 'clear' ? 13 : 10} fill="#ffd34d" stroke="#f0a92e" strokeWidth="1.4" />
        {sky === 'clear' && <Face x={32} y={32} />}
      </g>
    ))}
    {sky === 'partly' && <g className="wx-float"><Cloud x={4} y={14} /><Face x={34} y={44} s={0.9} /></g>}
    {sky === 'cloudy' && <g className="wx-float"><Cloud x={-4} y={4} fill="#eef1f6" s={0.75} /><Cloud x={2} y={12} /><Face x={32} y={42} /></g>}
    {sky === 'fog' && (
      <g>
        <Cloud x={2} y={2} fill="#f2f2f2" /><Face x={32} y={32} mood="sleepy" />
        <g stroke="#b9c0cc" strokeWidth="3" strokeLinecap="round" className="wx-fog"><path d="M12 50 h30" /><path d="M20 57 h32" /></g>
      </g>
    )}
    {(sky === 'drizzle' || sky === 'rain' || sky === 'storm' || sky === 'snow') && (
      <g>
        <g className="wx-float"><Cloud x={2} y={0} fill={sky === 'storm' ? '#d9dde6' : '#f4f6fa'} /><Face x={32} y={30} mood={sky === 'storm' ? 'worried' : 'happy'} /></g>
        {sky === 'snow'
          ? [16, 30, 44].map((x, i) => <text key={x} x={x} y={54} fontSize="10" textAnchor="middle" fill="#8ec5ff" className="wx-drop" style={{ animationDelay: `${i * 0.3}s` }}>❄</text>)
          : [18, 30, 42].slice(0, sky === 'drizzle' ? 2 : 3).map((x, i) => <path key={x} d={`M${x} 46 q-2 5 0 7 q2 -2 0 -7z`} fill="#6fb3f2" className="wx-drop" style={{ animationDelay: `${i * 0.3}s` }} />)}
        {sky === 'storm' && <path d="M36 42 l-6 10 h5 l-4 9 l10 -12 h-5 l4 -7z" fill="#ffd34d" stroke="#e0a42e" strokeWidth="1" strokeLinejoin="round" className="wx-bolt" />}
      </g>
    )}
  </svg>
);
