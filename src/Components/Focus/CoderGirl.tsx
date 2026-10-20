import React from 'react';
import { cn } from '../../Utils/classNames';

export type CoderState = 'typing' | 'idle' | 'break';

const SKIN = '#ffdcc8';
const SKIN_SHADE = '#f4bfa6';
const HAIR = '#4a3028';
const HAIR_HI = '#6b463a';
const HOODIE = '#b9a6e8';
const HOODIE_SHADE = '#9d88d6';
const LINE = '#3b2a26';

/** A cute developer girl at her laptop: types while you focus, stretches on breaks, smiles at you when paused. */
export const CoderGirl: React.FC<{ state: CoderState; className?: string }> = ({ state, className }) => {
  const typing = state === 'typing';
  const resting = state === 'break';
  return (
    <svg viewBox="0 0 220 200" className={cn('coder overflow-visible', `coder-${state}`, className)} aria-label={typing ? 'Kod yazıyor' : resting ? 'Mola veriyor' : 'Seni bekliyor'} role="img">
      {/* Chair back */}
      <rect x="62" y="96" width="96" height="104" rx="22" fill="#5d4a6e" />
      <rect x="70" y="104" width="80" height="96" rx="18" fill="#6e5a80" />

      <g className="cg-body">
        {/* Back hair */}
        <path d="M58 86 C 52 40, 82 22, 110 22 C 140 22, 168 40, 162 86 C 166 112, 160 128, 150 136 L 70 136 C 60 128, 54 112, 58 86 Z" fill={HAIR} />

        {/* Hoodie */}
        <path d="M54 200 C 54 156, 74 132, 110 132 C 146 132, 166 156, 166 200 Z" fill={HOODIE} />
        <path d="M92 134 Q 110 150 128 134" fill="none" stroke={HOODIE_SHADE} strokeWidth="4" strokeLinecap="round" />
        <path d="M100 140 v12 M120 140 v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <rect x="104" y="122" width="12" height="14" rx="5" fill={SKIN_SHADE} />

        {/* Head */}
        <g className="cg-head">
          <ellipse cx="110" cy="84" rx="44" ry="41" fill={SKIN} />
          {/* Space buns */}
          <circle cx="74" cy="38" r="15" fill={HAIR} /><circle cx="146" cy="38" r="15" fill={HAIR} />
          <path d="M68 32 q6 -6 12 0" stroke={HAIR_HI} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M140 32 q6 -6 12 0" stroke={HAIR_HI} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Bangs */}
          <path d="M66 82 C 64 52, 84 40, 110 40 C 136 40, 156 52, 154 82 C 148 70, 140 62, 132 60 C 130 68, 124 72, 116 72 C 118 66, 116 61, 112 58 C 106 66, 96 70, 86 70 C 88 64, 88 60, 86 58 C 78 64, 70 72, 66 82 Z" fill={HAIR} />
          <path d="M90 50 q10 -6 22 -4" stroke={HAIR_HI} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />

          {/* Headphones */}
          <path d="M64 74 C 62 30, 158 30, 156 74" stroke="#f08fb0" strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="54" y="70" width="16" height="26" rx="8" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.5" />
          <rect x="150" y="70" width="16" height="26" rx="8" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.5" />

          {/* Screen glow on the face while typing */}

          {/* Eyes: down at the screen while typing, ^ ^ on a break, at you when idle */}
          {resting ? (
            <g stroke={LINE} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M86 92 q8 -8 16 0" /><path d="M118 92 q8 -8 16 0" />
            </g>
          ) : (
            <g className="cg-eyes">
              <ellipse cx="94" cy="92" rx="8" ry="9.5" fill={LINE} />
              <ellipse cx="126" cy="92" rx="8" ry="9.5" fill={LINE} />
              <circle cx={typing ? 96 : 97} cy={typing ? 92 : 88} r="3.2" fill="white" />
              <circle cx={typing ? 128 : 129} cy={typing ? 92 : 88} r="3.2" fill="white" />
              <circle cx="91.5" cy="96" r="1.4" fill="white" opacity="0.8" />
              <circle cx="123.5" cy="96" r="1.4" fill="white" opacity="0.8" />
              {typing && <path d="M84 84 q10 4 20 2 M116 86 q10 2 20 -2" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />}
            </g>
          )}
          {/* Round glasses */}
          <g fill="white" fillOpacity="0.12" stroke="#6b4a3a" strokeWidth="1.8">
            <circle cx="94" cy="92" r="13" /><circle cx="126" cy="92" r="13" />
            <path d="M107 91 q3 -3 6 0" fill="none" />
          </g>
          {/* Blush, nose, mouth */}
          <ellipse cx="80" cy="106" rx="7" ry="4" fill="#ff9fb1" opacity="0.55" />
          <ellipse cx="140" cy="106" rx="7" ry="4" fill="#ff9fb1" opacity="0.55" />
          <path d="M108 103 q2 2 4 0" stroke={SKIN_SHADE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {resting
            ? <path d="M103 110 Q 110 119 117 110 Z" fill="#d9677a" stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
            : typing
              ? <path d="M106 112 q4 2 8 0" stroke={LINE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
              : <path d="M103 110 q7 6 14 0" stroke={LINE} strokeWidth="2" fill="none" strokeLinecap="round" />}
        </g>
      </g>

      {/* Hands on the keyboard, peeking over the lid */}
      {!resting && (
        <g>
          <g className="cg-hand cg-hand-l"><path d="M70 160 C 70 150, 76 144, 84 144" stroke={HOODIE} strokeWidth="15" strokeLinecap="round" fill="none" /><circle cx="86" cy="142" r="7.5" fill={SKIN} stroke={SKIN_SHADE} /></g>
          <g className="cg-hand cg-hand-r"><path d="M150 160 C 150 150, 144 144, 136 144" stroke={HOODIE} strokeWidth="15" strokeLinecap="round" fill="none" /><circle cx="134" cy="142" r="7.5" fill={SKIN} stroke={SKIN_SHADE} /></g>
        </g>
      )}

      {/* Arms stretched up over the head on a break */}
      {resting && (
        <g className="cg-stretch">
          <path d="M70 150 C 44 120, 40 60, 98 16" stroke={HOODIE} strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M150 150 C 176 120, 180 60, 122 16" stroke={HOODIE} strokeWidth="16" strokeLinecap="round" fill="none" />
          <circle cx="102" cy="14" r="8.5" fill={SKIN} stroke={SKIN_SHADE} />
          <circle cx="118" cy="14" r="8.5" fill={SKIN} stroke={SKIN_SHADE} />
        </g>
      )}

      {/* Laptop, seen from behind, with stickers */}
      <g>
        <path d="M58 142 L 162 142 L 168 200 L 52 200 Z" fill="#c9ced6" stroke="#8d939b" strokeWidth="1.5" />
        <path d="M62 146 L 158 146 L 163 200 L 57 200 Z" fill="#dde1e7" />
        <path d="M100 166 c -5 -6 -14 0 -8 8 l 8 8 l 8 -8 c 6 -8 -3 -14 -8 -8 z" fill="#f6a8c4" />
        <rect x="70" y="156" width="22" height="13" rx="3" fill="#3b2a4a" transform="rotate(-8 81 162)" />
        <text x="81" y="166" textAnchor="middle" fontSize="8" fontWeight="900" fill="#9fffb0" fontFamily="monospace" transform="rotate(-8 81 162)">&lt;/&gt;</text>
        <circle cx="140" cy="166" r="9" fill="#ffd36e" />
        <path d="M136 165 q4 5 8 0 M137 162 h0.1 M143 162 h0.1" stroke="#7a5a1e" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M126 186 l 4 -8 l 4 8 z" fill="#8fd1ad" />
      </g>

      {/* Code drifting up from the screen */}
      {typing && ['{ }', '</>', ';', '01', '()', '=>'].map((t, i) => (
        <text key={t} className="cg-code" x={[22, 176, 34, 188, 14, 166][i]} y={[130, 126, 112, 118, 100, 104][i]} fontSize="11" fontWeight="900" fontFamily="monospace"
          fill={['#7c6cd6', '#e0789a', '#4f9a72', '#d9a23a', '#4f86c0', '#c05c3e'][i]} style={{ animationDelay: `${i * 0.55}s` }}>{t}</text>
      ))}
      {state === 'idle' && <text className="cg-zz" x="168" y="56" fontSize="16" fontWeight="900" fill="#b9a6e8">♪</text>}
    </svg>
  );
};
