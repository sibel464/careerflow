import React from 'react';
import { PlantKind } from '../Utils/plants';

/** Blend healthy green toward dry yellow-brown as thirst goes past 1. */
const leafColor = (thirst: number, base = [79, 138, 85]) => {
  const t = Math.min(Math.max((thirst - 0.9) / 0.9, 0), 1);
  const dry = [185, 164, 90];
  const c = base.map((v, i) => Math.round(v + (dry[i] - v) * t));
  return `rgb(${c.join(',')})`;
};

interface Props { kind: PlantKind; thirst: number; pot: string; className?: string }

/** A potted plant drawn in SVG; leaves droop and fade when thirsty. */
export const PlantArt: React.FC<Props> = ({ kind, thirst, pot, className }) => {
  const droop = Math.min(Math.max(thirst - 0.8, 0), 1.2); // 0..1.2
  const leaf = leafColor(thirst);
  const leafDark = leafColor(thirst, [52, 104, 62]);
  const sway = droop > 0.2 ? '' : 'plant-sway';

  const potEl = (
    <g>
      <path d="M30 118 L36 156 Q37 160 42 160 L78 160 Q83 160 84 156 L90 118 Z" fill={pot} />
      <path d="M30 118 L36 156 Q37 160 42 160 L50 160 L44 118 Z" fill="rgba(0,0,0,0.12)" />
      <rect x="26" y="110" width="68" height="12" rx="3" fill={pot} />
      <rect x="26" y="110" width="68" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      <ellipse cx="60" cy="112" rx="30" ry="3.5" fill="#4a3426" />
    </g>
  );

  let plant: React.ReactNode;
  let front: React.ReactNode = null;
  if (kind === 'monstera') {
    const leaves = [
      { a: -38, l: 52, s: 1 }, { a: -12, l: 66, s: 1.1 }, { a: 18, l: 60, s: 1.05 }, { a: 42, l: 48, s: 0.9 },
    ];
    plant = leaves.map((lf, i) => {
      const a = lf.a + Math.sign(lf.a || 1) * droop * 40;
      return (
        <g key={i} transform={`rotate(${a} 60 112)`}>
          <path d={`M60 112 Q${60 + (i % 2 ? 3 : -3)} ${112 - lf.l / 2} 60 ${112 - lf.l}`} stroke={leafDark} strokeWidth="2.2" fill="none" />
          <g transform={`translate(60 ${112 - lf.l}) scale(${lf.s})`}>
            <path d="M0 4 C -22 0, -26 -26, -4 -34 Q 0 -30 4 -34 C 26 -26, 22 0, 0 4 Z" fill={leaf} />
            <path d="M0 2 L0 -30" stroke={leafDark} strokeWidth="1.2" />
            <path d="M-14 -10 L-6 -12 M-16 -20 L-5 -20 M14 -10 L6 -12 M16 -20 L5 -20" stroke="#f3ead8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
      );
    });
  } else if (kind === 'cactus') {
    const bend = droop * 10;
    plant = (
      <g transform={`rotate(${bend} 60 112)`}>
        <rect x="47" y="44" width="26" height="72" rx="13" fill={leaf} />
        <rect x="56" y="48" width="3" height="64" rx="1.5" fill={leafDark} opacity="0.5" />
        <path d="M47 82 Q34 82 34 70 L34 60" stroke={leaf} strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M73 74 Q86 74 86 62 L86 54" stroke={leaf} strokeWidth="11" strokeLinecap="round" fill="none" />
        {[[52, 56], [66, 64], [52, 78], [66, 92], [52, 100], [36, 64], [85, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#f3ead8" />)}
        {thirst < 0.7 && <g transform="translate(60 42)"><circle r="6" fill="#e86a8a" /><circle r="2.5" fill="#ffd86b" /></g>}
      </g>
    );
  } else if (kind === 'snake') {
    const blades = [-16, -6, 4, 14, 22];
    plant = blades.map((a, i) => {
      const h = [62, 80, 88, 74, 56][i];
      const ang = a + Math.sign(a || 1) * droop * 30;
      return (
        <g key={i} transform={`rotate(${ang} 60 112)`}>
          <path d={`M54 112 Q52 ${112 - h * 0.6} 60 ${112 - h} Q68 ${112 - h * 0.6} 66 112 Z`} fill={i % 2 ? leaf : leafDark} />
          <path d={`M57 104 L63 100 M56 92 L64 88 M57 80 L63 76`} stroke="#d8e2b8" strokeWidth="1.4" opacity="0.6" />
          <path d={`M54 112 Q52 ${112 - h * 0.6} 60 ${112 - h}`} stroke="#d9c96a" strokeWidth="1.5" fill="none" opacity="0.8" />
        </g>
      );
    });
  } else if (kind === 'flower') {
    const bloom = thirst < 1.2;
    plant = (
      <g>
        {[-30, 30, -60, 60].map((a, i) => (
          <g key={i} transform={`rotate(${a + Math.sign(a) * droop * 25} 60 110)`}>
            <ellipse cx="60" cy="96" rx="9" ry="16" fill={i < 2 ? leaf : leafDark} />
          </g>
        ))}
        {[[-14, 0], [0, -8], [14, 2]].map(([dx, dy], i) => (
          <g key={i} transform={`rotate(${droop * (i - 1) * 30} 60 108)`}>
            <path d={`M60 108 Q${60 + dx / 2} ${88 + dy} ${60 + dx} ${68 + dy + droop * 18}`} stroke={leafDark} strokeWidth="2" fill="none" />
            <g transform={`translate(${60 + dx} ${68 + dy + droop * 18})`} opacity={bloom ? 1 : 0.55}>
              {Array.from({ length: 5 }, (_, p) => <ellipse key={p} cx="0" cy="-5" rx="3.6" ry="5.5" fill={bloom ? '#a77bd6' : '#b9a3a3'} transform={`rotate(${p * 72})`} />)}
              <circle r="2.6" fill="#ffd86b" />
            </g>
          </g>
        ))}
      </g>
    );
  } else {
    // Pothos: a few upright leaves and vines spilling over the rim.
    plant = (
      <g>
        {[-30, 0, 28].map((a, i) => (
          <g key={i} transform={`rotate(${a + Math.sign(a || 1) * droop * 30} 60 112)`}>
            <path d={`M60 112 Q60 96 60 ${84 - i * 4}`} stroke={leafDark} strokeWidth="1.8" fill="none" />
            <path d={`M60 ${86 - i * 4} c -10 -2 -12 -16 0 -20 c 12 4 10 18 0 20 z`} fill={leaf} />
          </g>
        ))}
      </g>
    );
    front = (
      <g>
        {[[30, 1], [90, -1]].map(([x, dir], v) => (
          <g key={v}>
            <path d={`M${x} 114 Q${x - dir * 10} ${136 + droop * 8} ${x - dir * 4} ${170 + droop * 6}`} stroke={leafDark} strokeWidth="1.6" fill="none" />
            {[0, 1, 2, 3].map(k => (
              <path key={k} d={`M${x - dir * (k * 2.5)} ${124 + k * 13 + droop * k * 2} c ${-dir * 9} -1 ${-dir * 10} -12 0 -15 c ${dir * 9} 3 ${dir * 8} 14 0 15 z`} fill={k % 2 ? leaf : leafDark} />
            ))}
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 120 175" className={className} role="img" aria-hidden>
      <ellipse cx="60" cy="162" rx="34" ry="4" fill="rgba(0,0,0,0.18)" />
      <g className={sway} style={{ transformOrigin: '60px 112px' }}>{plant}</g>
      {potEl}
      {front}
    </svg>
  );
};
