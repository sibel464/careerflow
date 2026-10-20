import React from 'react';
import type { Palette } from '../Hooks/PreferencesContext';
import { MOTIFS, PALETTES, MotifShapeId as Shape } from '../Utils/palettes';

export const MotifShape: React.FC<{ shape: Shape; color: string; className?: string; style?: React.CSSProperties }> = ({ shape, color, className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
    {shape === 'star' && <path d="M12 2 C13 9 15 11 22 12 C15 13 13 15 12 22 C11 15 9 13 2 12 C9 11 11 9 12 2Z" fill={color} />}
    {shape === 'moon' && <path d="M15 3 A9.5 9.5 0 1 0 21 16 A7.5 7.5 0 1 1 15 3Z" fill={color} />}
    {shape === 'dot' && <circle cx="12" cy="12" r="5" fill={color} />}
    {shape === 'heart' && <path d="M12 21 C5 15.5 2 11.5 2 7.8 C2 5.1 4.1 3 6.7 3 C8.6 3 10.4 4.1 12 6 C13.6 4.1 15.4 3 17.3 3 C19.9 3 22 5.1 22 7.8 C22 11.5 19 15.5 12 21Z" fill={color} />}
    {shape === 'sun' && (
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={color}>
        <circle cx="12" cy="12" r="4.5" stroke="none" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} />;
        })}
      </g>
    )}
    {shape === 'flower' && (
      <g fill={color}>
        {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="12" cy="6.5" rx="3.6" ry="5" transform={`rotate(${a} 12 12)`} />)}
        <circle cx="12" cy="12" r="2.6" fill="white" opacity="0.7" />
      </g>
    )}
    {shape === 'bubble' && (
      <g>
        <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.6" />
        <path d="M7.5 9.5 A5 5 0 0 1 11 6.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    )}
    {shape === 'wave' && <path d="M1 13 q2.75 -5 5.5 0 t5.5 0 t5.5 0 t5.5 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />}
    {shape === 'leaf' && (
      <g>
        <path d="M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20Z" fill={color} />
        <path d="M5 19 C9 15 13 11 17 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" fill="none" />
      </g>
    )}
    {shape === 'sprig' && (
      <g fill={color} stroke={color} strokeWidth="1.4" strokeLinecap="round">
        <path d="M12 22 C12 15 12 9 12 2" fill="none" />
        {[6, 11, 16].map(y => (
          <React.Fragment key={y}>
            <ellipse cx="8.5" cy={y} rx="3.2" ry="1.7" transform={`rotate(-30 8.5 ${y})`} stroke="none" />
            <ellipse cx="15.5" cy={y + 2} rx="3.2" ry="1.7" transform={`rotate(30 15.5 ${y + 2})`} stroke="none" />
          </React.Fragment>
        ))}
      </g>
    )}
    {shape === 'petal' && <path d="M12 3 C17.5 7 17.5 15 12 21 C6.5 15 6.5 7 12 3Z" fill={color} />}
  </svg>
);

// A fixed, evenly-spread scatter so the pattern doesn't jump around between visits.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const SPOTS = Array.from({ length: 40 }, (_, i) => ({
  left: ((i % 8) + 0.15 + rand(i, 1) * 0.7) / 8 * 100,
  top: (Math.floor(i / 8) + 0.1 + rand(i, 2) * 0.8) / 5 * 100,
  size: 22 + rand(i, 3) * 26,
  rot: rand(i, 4) * 360,
  duration: 9 + rand(i, 5) * 9,
  delay: -rand(i, 6) * 12,
  opacity: 0.5 + rand(i, 7) * 0.3,
}));

/** The floating background layer for the personal space. */
export const ThemeMotifs: React.FC<{ palette: Palette }> = ({ palette }) => {
  const set = MOTIFS[palette];
  const p = PALETTES.find(x => x.id === palette) ?? PALETTES[0];
  const colors = [p.primary, p.accent, p.primary, p.blob];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#e6d2b0]/55 dark:bg-[#120d0a]/40" />
      {SPOTS.map((s, i) => (
        <span key={`${palette}-${i}`} className="motif absolute" style={{
          left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity,
          ['--rot' as string]: `${s.rot}deg`, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
        }}>
          <MotifShape shape={set.shapes[i % set.shapes.length]} color={colors[i % colors.length]} className="w-full h-full" />
        </span>
      ))}
    </div>
  );
};
