import React from 'react';
import { TreeKind } from '../../Utils/forest';

/** A grown tree, drawn with its base at (0,0). About 120 units tall at scale 1. */
export const ForestTree: React.FC<{ kind: TreeKind; night?: boolean }> = ({ kind, night }) => {
  const dim = night ? 0.55 : 1;
  const shade = (hex: string) => {
    if (!night) return hex;
    const n = parseInt(hex.slice(1), 16);
    const c = (v: number) => Math.round(v * dim).toString(16).padStart(2, '0');
    return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
  };

  switch (kind) {
    case 'pine':
      return (
        <g>
          <rect x="-5" y="-22" width="10" height="24" rx="2" fill={shade('#6b4c3a')} />
          {[[0, -22, 44], [0, -50, 36], [0, -76, 28], [0, -98, 18]].map(([x, y, w]) => (
            <path key={y} d={`M${x - w} ${y} L${x} ${y - 34} L${x + w} ${y} Z`} fill={shade(y === -22 ? '#2f6b45' : y === -50 ? '#357a4e' : '#3f8a5a')} />
          ))}
        </g>
      );
    case 'cherry':
      return (
        <g>
          <path d="M-5 0 Q-3 -30 -2 -50 L2 -50 Q3 -30 5 0Z" fill={shade('#5a3d2e')} />
          <path d="M-1 -40 Q-14 -50 -22 -58 M1 -44 Q12 -54 20 -62" stroke={shade('#5a3d2e')} strokeWidth="4" fill="none" strokeLinecap="round" />
          {[[-24, -66, 20], [20, -70, 22], [0, -82, 26], [-10, -58, 18], [12, -56, 16]].map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={shade('#f4b8c8')} />
          ))}
          {[[-18, -74], [10, -88], [24, -62], [-4, -64], [-28, -60], [4, -76]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill={shade('#e8607a')} />
          ))}
        </g>
      );
    case 'birch':
      return (
        <g>
          <rect x="-5" y="-60" width="10" height="62" rx="4" fill={shade('#f3efe6')} />
          {[-12, -26, -40, -52].map(y => <rect key={y} x={y % 2 ? -5 : -1} y={y} width="6" height="2.5" rx="1" fill={shade('#3d3530')} />)}
          {[[-18, -78, 22], [16, -82, 22], [0, -96, 24], [0, -70, 20]].map(([cx, cy, r]) => (
            <ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx={r} ry={r * 1.15} fill={shade(cy === -96 ? '#a8cf6f' : '#93c15d')} />
          ))}
        </g>
      );
    case 'maple':
      return (
        <g>
          <path d="M-6 0 Q-4 -28 -3 -46 L3 -46 Q4 -28 6 0Z" fill={shade('#6b4c3a')} />
          {[[-22, -62, 22], [22, -64, 22], [0, -80, 28], [0, -54, 20]].map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={shade(cx === 0 && cy === -80 ? '#e8902f' : cx < 0 ? '#d9652c' : '#c9502a')} />
          ))}
          <circle cx="-8" cy="-86" r="9" fill={shade('#f2b13a')} opacity="0.8" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M-7 0 Q-5 -30 -4 -48 L4 -48 Q5 -30 7 0Z" fill={shade('#6b4c3a')} />
          {[[-24, -60, 24], [24, -60, 24], [0, -82, 30], [-12, -46, 18], [14, -46, 18]].map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={shade(cy === -82 ? '#5aa35c' : '#4a9150')} />
          ))}
          <circle cx="-10" cy="-90" r="10" fill="#fff" opacity={night ? 0.04 : 0.12} />
        </g>
      );
  }
};

/** The young tree you're growing right now, from seed (0) to almost grown (1). */
export const Sapling: React.FC<{ fraction: number; kind: TreeKind }> = ({ fraction, kind }) => {
  if (fraction < 0.15) {
    // A seed just breaking the soil.
    return (
      <g>
        <ellipse cx="0" cy="-2" rx="9" ry="5" fill="#8a5a3c" />
        <path d="M0 -4 Q-1 -10 0 -16" stroke="#6fb06a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M0 -14 q7 -2 10 -8 q-7 0 -10 8z M0 -14 q-7 -2 -10 -8 q7 0 10 8z" fill="#7cc06f" />
      </g>
    );
  }
  // From sprout to young tree: the same kind as the grown one, just smaller.
  const scale = 0.18 + (fraction - 0.15) * 0.75;
  return (
    <g>
      <g transform={`scale(${scale})`}><ForestTree kind={kind} /></g>
      {fraction < 0.4 && <path d="M0 0 q-6 -6 -12 -4 M0 0 q6 -6 12 -4" stroke="#6fb06a" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </g>
  );
};
