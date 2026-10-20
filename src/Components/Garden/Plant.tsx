import React from 'react';
import { ApplicationStatus } from '../../Interfaces';

export type Species = 'sunflower' | 'tulip' | 'rose' | 'daisy' | 'lavender' | 'cactus';
export type Stage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'wilted';

export const SPECIES: { id: Species; name: string; emoji: string }[] = [
  { id: 'sunflower', name: 'Ayçiçeği', emoji: '🌻' },
  { id: 'tulip', name: 'Lale', emoji: '🌷' },
  { id: 'rose', name: 'Gül', emoji: '🌹' },
  { id: 'daisy', name: 'Papatya', emoji: '🌼' },
  { id: 'lavender', name: 'Lavanta', emoji: '💜' },
  { id: 'cactus', name: 'Kaktüs', emoji: '🌵' },
];

export const STAGE_BY_STATUS: Record<ApplicationStatus, Stage> = {
  'Başvuruldu': 'seed',
  'Mülakat Bekleniyor': 'sprout',
  'Mülakat Yapıldı': 'bud',
  'Kabul Edildi': 'bloom',
  'Reddedildi': 'wilted',
};

export const STAGE_LABEL: Record<Stage, string> = {
  seed: 'Tohum', sprout: 'Fide', bud: 'Tomurcuk', bloom: 'Çiçek açtı', wilted: 'Soldu',
};

/** Same company → same flower, every time. */
export const speciesFor = (name: string): Species => {
  const hash = [...name].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return SPECIES[hash % SPECIES.length].id;
};

const COLOR: Record<Species, string> = {
  sunflower: '#f2c230', tulip: '#e8607a', rose: '#c0392b', daisy: '#ffffff', lavender: '#9b7fd1', cactus: '#f48fb1',
};
const STEM = '#4f8f4a';
const LEAF = '#6fb06a';
const DRY = '#a08060';

const Leaf: React.FC<{ x: number; y: number; flip?: boolean; color?: string; size?: number }> = ({ x, y, flip, color = LEAF, size = 1 }) => (
  <path
    d={`M${x} ${y} q${(flip ? -1 : 1) * 12 * size} ${-4 * size} ${(flip ? -1 : 1) * 16 * size} ${-12 * size} q${(flip ? 1 : -1) * 10 * size} ${2 * size} ${(flip ? 1 : -1) * 16 * size} ${12 * size} z`}
    fill={color}
  />
);

const Head: React.FC<{ species: Species; y: number; open: boolean }> = ({ species, y, open }) => {
  const c = COLOR[species];
  if (!open) {
    return <ellipse cx="0" cy={y - 6} rx="5.5" ry="10" fill={species === 'daisy' ? '#f3f0e6' : c} stroke="rgba(0,0,0,0.1)" />;
  }
  switch (species) {
    case 'sunflower':
      return (
        <g transform={`translate(0 ${y - 8})`}>
          {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx="0" cy="-13" rx="4.5" ry="9" fill={c} transform={`rotate(${i * (360 / 14)})`} />)}
          <circle r="9" fill="#6b4c3a" />
          {[[-3, -3], [3, -2], [0, 3], [-4, 3], [4, 4]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={dx} cy={dy} r="1.2" fill="#4a3220" />)}
        </g>
      );
    case 'daisy':
      return (
        <g transform={`translate(0 ${y - 6})`}>
          {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="0" cy="-9" rx="2.6" ry="7" fill="#fff" stroke="#e6e0d0" strokeWidth="0.5" transform={`rotate(${i * 30})`} />)}
          <circle r="5" fill="#e8b923" />
        </g>
      );
    case 'tulip':
      return (
        <g transform={`translate(0 ${y})`}>
          <path d="M-10 -4 Q-12 -20 -6 -24 L0 -16 L6 -24 Q12 -20 10 -4 Q0 4 -10 -4Z" fill={c} />
          <path d="M-3 -2 Q0 -22 3 -2Z" fill="#f28da0" opacity="0.7" />
        </g>
      );
    case 'rose':
      return (
        <g transform={`translate(0 ${y - 8})`}>
          <circle r="11" fill={c} />
          <path d="M-6 -2 Q0 -10 6 -2 Q0 6 -6 -2Z" fill="#a52a1f" />
          <path d="M-3 -1 Q0 -5 3 -1" stroke="#7d1f17" strokeWidth="1.4" fill="none" />
          <path d="M-9 4 Q0 12 9 4" stroke="#a52a1f" strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'lavender':
      return (
        <g transform={`translate(0 ${y})`}>
          {[-7, 0, 7].map((dx, i) => (
            <g key={dx} transform={`translate(${dx} ${i === 1 ? -6 : 0})`}>
              {Array.from({ length: 6 }, (_, j) => <ellipse key={j} cx={j % 2 ? 1.5 : -1.5} cy={-j * 4} rx="2.6" ry="3" fill={c} />)}
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
};

const Cactus: React.FC<{ stage: Stage }> = ({ stage }) => {
  const body = stage === 'wilted' ? '#b5a65a' : '#4f8f5a';
  const h = { seed: 10, sprout: 22, bud: 36, bloom: 44, wilted: 30 }[stage];
  return (
    <g>
      <rect x="-8" y={-h} width="16" height={h} rx="8" fill={body} />
      {(stage === 'bud' || stage === 'bloom') && (
        <>
          <path d={`M-8 ${-h * 0.45} h-8 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 8 0 v6 h4`} fill={body} />
          <path d={`M8 ${-h * 0.6} h8 a4 4 0 0 0 4 -4 v-8 a4 4 0 0 0 -8 0 v4 h-4`} fill={body} />
        </>
      )}
      {[-4, 0, 4].map(dx => <line key={dx} x1={dx} y1={-h + 4} x2={dx} y2={-2} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />)}
      {stage === 'bloom' && (
        <g transform={`translate(0 ${-h - 3})`}>
          {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-4" rx="3" ry="4.5" fill={COLOR.cactus} transform={`rotate(${a})`} />)}
          <circle r="2.2" fill="#e8b923" />
        </g>
      )}
      {stage === 'bud' && <circle cy={-h - 2} r="3.5" fill={COLOR.cactus} />}
      {stage === 'wilted' && <path d={`M8 ${-h + 6} q8 2 10 10`} stroke={body} strokeWidth="6" strokeLinecap="round" fill="none" />}
    </g>
  );
};

/** One plant in the garden, grown to the stage its application has reached. */
export const Plant: React.FC<{ species: Species; stage: Stage; label: string; delay?: number }> = ({ species, stage, label, delay = 0 }) => {
  const shortLabel = label.length > 10 ? `${label.slice(0, 9)}…` : label;
  return (
    <g className="garden-plant">
      {/* Name stake */}
      <g transform="translate(0 6)">
        <rect x="-1.5" y="0" width="3" height="16" fill="#8a6a4a" />
        <rect x="-26" y="6" width="52" height="14" rx="3" fill="#d9b88f" stroke="#a88560" strokeWidth="1" />
        <text x="0" y="16.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#4a3f35" fontFamily="Nunito, sans-serif">{shortLabel}</text>
      </g>

      {/* Soil mound */}
      <ellipse cx="0" cy="0" rx="16" ry="5" fill="#5c3a24" />

      <g className="plant-sway" style={{ animationDelay: `${-delay}s` }}>
        {species === 'cactus' ? <Cactus stage={stage} /> : (
          <>
            {stage === 'seed' && (
              <g>
                <ellipse cx="0" cy="-3" rx="5" ry="3.5" fill="#8a5a3c" />
                <path d="M0 -5 q-1 -6 0 -9" stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round" />
                <Leaf x={0} y={-12} size={0.45} />
                <Leaf x={0} y={-12} size={0.45} flip />
              </g>
            )}
            {stage === 'sprout' && (
              <g>
                <path d="M0 0 Q-2 -16 0 -32" stroke={STEM} strokeWidth="3" fill="none" strokeLinecap="round" />
                <Leaf x={0} y={-14} size={0.9} />
                <Leaf x={-1} y={-24} size={0.8} flip />
                <Leaf x={0} y={-32} size={0.5} />
              </g>
            )}
            {(stage === 'bud' || stage === 'bloom') && (
              <g>
                <path d={`M0 0 Q-3 -${stage === 'bloom' ? 32 : 26} 0 -${stage === 'bloom' ? 62 : 50}`} stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
                <Leaf x={0} y={-16} size={1.1} />
                <Leaf x={-1} y={-28} size={1} flip />
                {stage === 'bloom' && <Leaf x={0} y={-40} size={0.8} />}
                <Head species={species} y={stage === 'bloom' ? -62 : -50} open={stage === 'bloom'} />
              </g>
            )}
            {stage === 'wilted' && (
              <g>
                <path d="M0 0 Q3 -26 -6 -36 Q-14 -40 -16 -30" stroke={DRY} strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M0 -12 q8 -2 12 6" stroke={DRY} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="-16" cy="-27" r="5" fill="#8a6a4a" />
                <ellipse cx="10" cy="-1" rx="4" ry="1.8" fill="#c9a27a" transform="rotate(20 10 -1)" />
                <ellipse cx="-12" cy="0" rx="3.5" ry="1.6" fill="#b88a5a" transform="rotate(-15 -12 0)" />
              </g>
            )}
          </>
        )}
      </g>

      {stage === 'bloom' && (
        <g className="garden-sparkle" fill="#f7d774">
          <path d="M-22 -60 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" />
          <path d="M20 -74 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5z" />
        </g>
      )}
    </g>
  );
};
