import React, { useState } from 'react';
import { Habit } from '../Utils/personal';
import { cn } from '../Utils/classNames';

const JAR = 'M14 30 Q14 22 22 22 L78 22 Q86 22 86 30 L88 112 Q88 126 74 126 L26 126 Q12 126 12 112 Z';
const GLASS = 'M16 14 L84 14 L76 120 Q75 126 69 126 L31 126 Q25 126 24 120 Z';

/** A jar (or a drinking glass for water-like habits) that fills up as you log the habit. */
export const HabitJar: React.FC<{ habit: Habit; value: number; onTap?: () => void; className?: string }> = ({ habit, value, onTap, className }) => {
  const [splash, setSplash] = useState(0);
  const p = Math.min(value / habit.target, 1);
  const glass = /bardak|su|glass|ml|litre/i.test(`${habit.unit} ${habit.name}`);
  const shape = glass ? GLASS : JAR;
  const top = glass ? 14 : 22;
  const level = 126 - (126 - top - 6) * p;
  const id = `jar-${habit.id}`;
  const done = p >= 1;

  return (
    <button type="button" onClick={() => { onTap?.(); setSplash(s => s + 1); }} aria-label={`${habit.name}: ${value}/${habit.target}. Dokun, +1`}
      className={cn('relative group outline-none focus-visible:ring-2 focus-visible:ring-moss rounded-2xl', className)}>
      <svg viewBox="0 0 100 130" className={cn('w-full h-full overflow-visible drop-shadow-[0_8px_8px_rgba(0,0,0,0.18)] transition-transform group-hover:-translate-y-1 group-active:scale-95', done && 'jar-done')}>
        <defs>
          <clipPath id={`${id}-clip`}><path d={shape} /></clipPath>
          <linearGradient id={`${id}-liquid`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={habit.color} stopOpacity="0.75" />
            <stop offset="1" stopColor={habit.color} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {/* Back of the glass */}
        <path d={shape} fill="rgba(255,255,255,0.35)" />
        {/* Liquid with a moving wave */}
        <g clipPath={`url(#${id}-clip)`}>
          <g style={{ transform: `translateY(${level}px)`, transition: 'transform 0.9s cubic-bezier(0.34,1.4,0.64,1)' }}>
            <path className="jar-wave" d="M-100 0 Q -75 -6 -50 0 T 0 0 T 50 0 T 100 0 T 150 0 T 200 0 V 140 H -100 Z" fill={`url(#${id}-liquid)`} />
            <path className="jar-wave jar-wave-slow" d="M-100 2 Q -75 -3 -50 2 T 0 2 T 50 2 T 100 2 T 150 2 T 200 2 V 140 H -100 Z" fill={habit.color} opacity="0.35" />
            {p > 0 && [18, 46, 70].map((x, i) => <circle key={x} cx={x + (splash % 3) * 4} cy={22 + i * 9} r={2 + (i % 2)} fill="white" opacity="0.5" className="jar-bubble" style={{ animationDelay: `${i * 0.6}s` }} />)}
          </g>
        </g>
        {/* Glass outline and shine */}
        <path d={shape} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
        <path d={shape} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <path d={glass ? 'M26 24 L22 100' : 'M22 38 L21 104'} stroke="white" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        <path d={glass ? 'M33 24 L31 44' : 'M29 38 L29 52'} stroke="white" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
        {/* Lid */}
        {!glass && <>
          <rect x="20" y="6" width="60" height="17" rx="4" fill={habit.color} />
          <rect x="20" y="6" width="60" height="17" rx="4" fill="url(#lid-shine)" opacity="0.6" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={26 + i * 6} x2={26 + i * 6} y1="9" y2="20" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />)}
        </>}
        {/* Paper label with the emoji */}
        <g transform={`rotate(-4 50 ${glass ? 66 : 74})`}>
          <rect x="28" y={glass ? 48 : 56} width="44" height="36" rx="6" fill="#fffaf0" stroke="rgba(0,0,0,0.08)" />
          <text x="50" y={glass ? 73 : 81} textAnchor="middle" fontSize="20">{done ? '✨' : habit.emoji}</text>
        </g>
        <defs>
          <linearGradient id="lid-shine" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="white" stopOpacity="0.7" /><stop offset="0.5" stopColor="white" stopOpacity="0" /></linearGradient>
        </defs>
      </svg>
      {splash > 0 && <span key={splash} className="jar-plus pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 font-black text-lg" style={{ color: habit.color }}>+1</span>}
    </button>
  );
};
