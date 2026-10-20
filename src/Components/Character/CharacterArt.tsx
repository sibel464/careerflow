import React, { useId } from 'react';
import type { CharacterConfig } from '../../Utils/character';
import { cn } from '../../Utils/classNames';

export type CharacterPose = 'idle' | 'walk' | 'wave' | 'jump';

const mix = (c: string, to: string, pct: number) => `color-mix(in srgb, ${c}, ${to} ${pct}%)`;
const INK = '#3b2a26';
/** Head-and-shoulders crop vs. the whole body. */
const VIEW = { full: '0 0 200 300', head: '34 8 132 132', body: '36 118 128 170' };

/* ---------- Hair: a back layer (behind the face) and a front layer (bangs) ---------- */

const hairBack = (c: CharacterConfig) => {
  const f = c.hairColor;
  switch (c.hair) {
    case 'bob': return <path d="M46 94 C42 50 70 36 100 36 C130 36 158 50 154 94 C156 114 152 128 144 134 C130 140 70 140 56 134 C48 128 44 114 46 94Z" fill={f} />;
    case 'long': return <path d="M44 94 C38 48 70 34 100 34 C130 34 162 48 156 94 C160 132 162 170 154 200 C140 206 60 206 46 200 C38 170 40 132 44 94Z" fill={f} />;
    case 'ponytail': return (
      <g>
        <g className="ch-pony" style={{ transformOrigin: '140px 62px' }}>
          <path d="M136 58 C172 60 180 104 170 146 C166 166 150 172 146 154 C154 122 152 92 132 72Z" fill={f} />
        </g>
        <path d="M52 92 C48 52 72 40 100 40 C128 40 152 52 148 92 C148 104 144 112 140 114 L60 114 C56 112 52 104 52 92Z" fill={f} />
        <circle cx="140" cy="62" r="5" fill="#f6a8c4" />
      </g>
    );
    case 'buns': return (
      <g>
        <circle cx="64" cy="46" r="17" fill={f} /><circle cx="136" cy="46" r="17" fill={f} />
        <path d="M58 40 q6 -6 12 0 M130 40 q6 -6 12 0" stroke="white" strokeOpacity="0.25" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M50 94 C46 52 72 40 100 40 C128 40 154 52 150 94 C152 112 148 124 140 128 L60 128 C52 124 48 112 50 94Z" fill={f} />
      </g>
    );
    case 'braids': return <path d="M52 92 C48 52 72 40 100 40 C128 40 152 52 148 92 C148 106 144 114 140 116 L60 116 C56 114 52 106 52 92Z" fill={f} />;
    case 'curly': return (
      <g fill={f}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = Math.PI + (i / 15) * Math.PI * 1.25 - 0.6;
          return <circle key={i} cx={100 + Math.cos(a) * 52} cy={90 + Math.sin(a) * 50} r={i % 2 ? 17 : 20} />;
        })}
        <ellipse cx="100" cy="76" rx="52" ry="44" />
      </g>
    );
    default: return <path d="M54 90 C50 52 72 40 100 40 C128 40 150 52 146 90 C146 100 144 106 140 108 L60 108 C56 106 54 100 54 90Z" fill={c.hairColor} />;
  }
};

const hairFront = (c: CharacterConfig) => {
  const f = c.hairColor;
  switch (c.hair) {
    case 'bob': return (
      <g fill={f}>
        <path d="M54 88 C52 56 74 44 100 44 C126 44 148 56 146 88 C140 78 132 72 124 70 L120 76 L112 70 L104 77 L96 70 L88 77 L80 70 L72 76 C64 78 58 82 54 88Z" />
        <path d="M54 82 C50 104 52 122 62 134 C64 118 62 100 66 86Z" /><path d="M146 82 C150 104 148 122 138 134 C136 118 138 100 134 86Z" />
      </g>
    );
    case 'long': return (
      <g fill={f}>
        <path d="M54 90 C50 54 76 42 102 42 C128 42 150 56 146 90 C138 72 120 60 100 62 C86 64 72 72 62 86Z" />
        <path d="M54 84 C44 120 48 164 58 196 C66 166 64 122 66 92Z" /><path d="M146 84 C156 120 152 164 142 196 C134 166 136 122 134 92Z" />
      </g>
    );
    case 'ponytail': return <path d="M54 88 C54 56 76 44 102 44 C128 44 148 56 146 84 C132 66 110 60 90 66 C76 70 62 78 54 88Z" fill={f} />;
    case 'buns': return <path transform="translate(-10 8)" d="M66 82 C 64 52, 84 40, 110 40 C 136 40, 156 52, 154 82 C 148 70, 140 62, 132 60 C 130 68, 124 72, 116 72 C 118 66, 116 61, 112 58 C 106 66, 96 70, 86 70 C 88 64, 88 60, 86 58 C 78 64, 70 72, 66 82 Z" fill={f} />;
    case 'braids': return (
      <g fill={f}>
        <path d="M54 88 C52 54 76 44 100 44 C124 44 148 54 146 88 C136 72 118 62 100 52 C82 62 64 72 54 88Z" />
        {[58, 142].map(x => (
          <g key={x} className="ch-braid" style={{ transformOrigin: `${x}px 112px` }}>
            {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={x + (i % 2 ? 2 : -2)} cy={118 + i * 13} rx="9" ry="8" fill={f} stroke={mix(f, 'black', 25)} strokeWidth="1" />)}
            <rect x={x - 5} y={192} width="10" height="5" rx="2" fill="#f6a8c4" />
            <path d={`M${x - 4} 198 l-2 9 M${x} 198 v10 M${x + 4} 198 l2 9`} stroke={f} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
    case 'curly': return <g fill={f}>{[66, 80, 94, 108, 122, 136].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 60 : 56} r="11" />)}</g>;
    case 'spiky': return <path d="M54 86 C52 54 76 42 100 42 C126 42 148 54 146 86 L138 70 L130 80 L120 64 L110 78 L100 62 L90 78 L80 64 L70 80 L62 70Z" fill={f} />;
    default: return <path d="M54 84 C52 54 76 42 100 42 C126 42 148 54 146 82 C132 64 110 62 92 66 C78 68 64 74 54 84Z" fill={f} />;
  }
};

/* ---------- Face features ---------- */

const EYES = [82, 118];

const Eyes: React.FC<{ c: CharacterConfig; id: string; force?: 'happy' }> = ({ c, id, force }) => {
  const style = force ?? c.eyes;
  if (style === 'happy') return <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none">{EYES.map(x => <path key={x} d={`M${x - 8} 99 q8 -8 16 0`} />)}</g>;
  if (style === 'sleepy') return (
    <g>
      {EYES.map(x => (
        <g key={x}>
          <path d={`M${x - 7.5} 96 a7.5 7 0 0 0 15 0 z`} fill={`url(#iris${id})`} />
          <path d={`M${x - 9} 96 h18`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={x + 2} cy="99" r="1.6" fill="white" />
        </g>
      ))}
    </g>
  );
  const open = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy="96" rx="7.5" ry="9" fill={`url(#iris${id})`} />
      <ellipse cx={x} cy="97" rx="4" ry="5.6" fill="#1a110c" />
      {style === 'sparkle'
        ? <path d={`M${x + 2.6} 89.5 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1z`} fill="white" />
        : <circle cx={x + 2.6} cy="92.6" r="2.7" fill="white" />}
      <circle cx={x - 2.4} cy="100.5" r="1.3" fill="white" opacity="0.85" />
      {style === 'lashes' && <path d={x < 100 ? `M${x - 7} 90 l-4 -3 M${x - 5} 88 l-2 -4` : `M${x + 7} 90 l4 -3 M${x + 5} 88 l2 -4`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
    </g>
  );
  if (style === 'wink') return (
    <g>
      <g className="ch-eyes" style={{ transformOrigin: '82px 96px' }}>{open(82)}</g>
      <path d="M110 97 q8 -7 16 0" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </g>
  );
  return <g className="ch-eyes" style={{ transformOrigin: '100px 96px' }}>{EYES.map(open)}</g>;
};

const Brows: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  const color = mix(c.hairColor, 'black', 30);
  const d = { soft: 'q8 -4 16 0', arched: 'q8 -8 16 -1', straight: 'h16', thick: 'q8 -4 16 0' }[c.brows];
  return <g stroke={color} strokeWidth={c.brows === 'thick' ? 4.6 : 2.6} strokeLinecap="round" fill="none">{EYES.map(x => <path key={x} d={`M${x - 8} 81 ${d}`} />)}</g>;
};

const Mouth: React.FC<{ c: CharacterConfig; force?: 'grin' }> = ({ c, force }) => {
  const m = force ?? c.mouth;
  switch (m) {
    case 'grin': return (
      <g>
        <path d="M91 113 Q100 126 109 113 Z" fill="#c85a6a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M93.5 114 h13 l-1 2.5 h-11z" fill="white" />
      </g>
    );
    case 'cat': return <path d="M92 114 q4 4 8 0 q4 4 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />;
    case 'o': return <ellipse cx="100" cy="117" rx="4" ry="5" fill="#c85a6a" stroke={INK} strokeWidth="1.4" />;
    case 'tongue': return (
      <g>
        <path d="M92 113 Q100 122 108 113 Z" fill="#c85a6a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M97 117 q3 7 6 0 z" fill="#f2849a" />
      </g>
    );
    case 'smirk': return <path d="M93 116 q8 3 15 -3" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    default: return <path d="M92 114 q8 7 16 0" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
  }
};

const GlassesArt: React.FC<{ kind: CharacterConfig['glasses'] }> = ({ kind }) => {
  if (kind === 'none') return null;
  const frame = kind === 'sun' ? '#2b2420' : '#5a3f32';
  const lens = kind === 'sun' ? { fill: '#2b2b3a', fillOpacity: 0.9 } : { fill: 'white', fillOpacity: 0.14 };
  return (
    <g stroke={frame} strokeWidth="2">
      {EYES.map(x => kind === 'round' ? <circle key={x} cx={x} cy="96" r="12.5" {...lens} />
        : kind === 'cateye' ? <path key={x} d={x < 100 ? `M${x - 13} 90 Q${x - 14} 106 ${x} 107 Q${x + 12} 106 ${x + 12} 93 Q${x} 87 ${x - 13} 90 L${x - 16} 85Z` : `M${x + 13} 90 Q${x + 14} 106 ${x} 107 Q${x - 12} 106 ${x - 12} 93 Q${x} 87 ${x + 13} 90 L${x + 16} 85Z`} {...lens} strokeLinejoin="round" />
        : <rect key={x} x={x - 13} y="86" width="26" height="20" rx={kind === 'sun' ? 8 : 4} {...lens} />)}
      <path d="M94.5 95 q5.5 -4 11 0" fill="none" />
      {kind === 'sun' && EYES.map(x => <path key={`s${x}`} d={`M${x - 7} 92 l6 6`} stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />)}
    </g>
  );
};

const HeadwearArt: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  switch (c.headwear) {
    case 'beanie': return (
      <g>
        <path d="M48 82 C46 40 72 24 100 24 C128 24 154 40 152 82 Z" fill="#f28c6b" />
        <path d="M60 40 v38 M74 30 v48 M88 26 v52 M102 25 v53 M116 27 v51 M130 32 v46 M142 42 v36" stroke="#d9734f" strokeWidth="2" />
        <rect x="44" y="70" width="112" height="18" rx="9" fill="#e07b56" />
        <circle cx="100" cy="20" r="10" fill="#fff4ea" />
      </g>
    );
    case 'cap': return (
      <g>
        <path d="M50 78 C48 40 74 28 100 28 C126 28 152 40 150 78 Z" fill="#4f86c0" />
        <path d="M100 28 v50" stroke="#3c6fa6" strokeWidth="2" />
        <circle cx="100" cy="29" r="4" fill="#3c6fa6" />
        <path d="M60 78 Q100 70 150 76 Q176 80 176 88 Q150 88 100 84 Z" fill="#3c6fa6" />
      </g>
    );
    case 'headphones': return (
      <g>
        <path d="M54 92 C50 30 150 30 146 92" stroke="#f08fb0" strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="42" y="84" width="18" height="30" rx="9" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.5" />
        <rect x="140" y="84" width="18" height="30" rx="9" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.5" />
      </g>
    );
    case 'bow': return (
      <g transform="translate(130 46) rotate(18)">
        <path d="M0 0 L-18 -11 Q-22 0 -18 11 Z" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M0 0 L18 -11 Q22 0 18 11 Z" fill="#f6a8c4" stroke="#d9728f" strokeWidth="1.4" strokeLinejoin="round" />
        <circle r="5" fill="#f08fb0" />
      </g>
    );
    case 'flower': return (
      <g transform="translate(64 58)">
        {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-7" rx="5" ry="7.5" fill="#fff4f7" stroke="#f6a8c4" strokeWidth="1" transform={`rotate(${a})`} />)}
        <circle r="4.5" fill="#ffd36e" />
      </g>
    );
    case 'crown': return (
      <g transform="translate(100 40)">
        <path d="M-20 4 L-20 -14 L-10 -4 L0 -18 L10 -4 L20 -14 L20 4 Z" fill="#f5c542" stroke="#c9962a" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="0" cy="-3" r="2.6" fill="#e0525a" /><circle cx="-12" cy="0" r="2" fill="#4f86c0" /><circle cx="12" cy="0" r="2" fill="#4f9a72" />
      </g>
    );
    case 'catears': return (
      <g>
        <path d="M56 70 C56 40 144 40 144 70" stroke="#3b3a48" strokeWidth="4" fill="none" />
        {[[66, 1], [134, -1]].map(([x, s]) => (
          <g key={x} transform={`translate(${x} 46) scale(${s} 1)`}>
            <path d="M-12 8 L-4 -16 L12 4 Z" fill={c.hairColor} stroke="#3b3a48" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M-6 4 L-3 -8 L5 2 Z" fill="#f6b3bd" />
          </g>
        ))}
      </g>
    );
    default: return null;
  }
};

/* ---------- Clothes ---------- */

const TORSO = 'M66 162 C66 148 80 142 100 142 C120 142 134 148 134 162 L132 214 L68 214 Z';

const TopArt: React.FC<{ c: CharacterConfig; id: string }> = ({ c, id }) => {
  const t = c.topColor;
  const shade = mix(t, 'black', 14);
  return (
    <g>
      <path d={TORSO} fill={t} stroke={mix(t, 'black', 22)} strokeWidth="1.2" />
      {c.top === 'hoodie' && (
        <g>
          <path d="M78 146 Q100 166 122 146" fill="none" stroke={shade} strokeWidth="5" strokeLinecap="round" />
          <path d="M94 152 v14 M106 152 v14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M80 192 h40 v14 q-20 6 -40 0 z" fill={shade} opacity="0.6" />
        </g>
      )}
      {c.top === 'tee' && <path d="M88 143 Q100 156 112 143" fill={c.skin} />}
      {c.top === 'sweater' && (
        <g>
          <clipPath id={`torso${id}`}><path d={TORSO} /></clipPath>
          <g clipPath={`url(#torso${id})`} stroke="white" strokeOpacity="0.55" strokeWidth="5">
            {[164, 180, 196].map(y => <path key={y} d={`M60 ${y} H140`} />)}
          </g>
          <path d="M86 144 Q100 152 114 144" fill="none" stroke={shade} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {c.top === 'shirt' && (
        <g>
          <path d="M100 146 L86 142 L90 158 Z M100 146 L114 142 L110 158 Z" fill="white" stroke={mix(t, 'black', 25)} strokeWidth="1" />
          {[164, 178, 192, 206].map(y => <circle key={y} cx="100" cy={y} r="1.8" fill={mix(t, 'black', 35)} />)}
          <path d="M100 148 V214" stroke={mix(t, 'black', 20)} strokeWidth="1" />
        </g>
      )}
      {c.top === 'jacket' && (
        <g>
          <path d="M90 144 L100 214 L110 144 Q100 150 90 144Z" fill="#fff8ee" />
          <path d="M88 144 L98 176 L90 182 Z M112 144 L102 176 L110 182 Z" fill={shade} />
          <rect x="72" y="190" width="14" height="4" rx="2" fill={shade} /><rect x="114" y="190" width="14" height="4" rx="2" fill={shade} />
        </g>
      )}
      {c.top === 'dress' && (
        <g>
          <path d="M86 143 Q100 154 114 143" fill={c.skin} />
          <path d="M68 204 L132 204 L150 254 Q100 262 50 254 Z" fill={t} stroke={mix(t, 'black', 22)} strokeWidth="1.2" />
          <path d="M70 206 H130" stroke={shade} strokeWidth="4" />
          <path d="M62 236 q8 6 16 0 q8 6 16 0 q8 6 16 0 q8 6 16 0 q8 6 16 0" stroke="white" strokeOpacity="0.45" strokeWidth="2" fill="none" />
        </g>
      )}
    </g>
  );
};

const LegsArt: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  const p = c.bottomColor;
  const dress = c.top === 'dress';
  const skinLegs = dress || c.bottom === 'skirt' || c.bottom === 'shorts';
  const legFill = (side: 'l' | 'r') => {
    const x = side === 'l' ? 82 : 101;
    if (skinLegs) return <rect x={x + 1} y="214" width="15" height="62" rx="7" fill={c.skin} stroke={mix(c.skin, 'black', 12)} strokeWidth="1" />;
    return (
      <g>
        <rect x={x} y="210" width="17" height="66" rx="7" fill={p} stroke={mix(p, 'black', 22)} strokeWidth="1.2" />
        {c.bottom === 'jeans' && <path d={`M${x + 8.5} 214 V272`} stroke={mix(p, 'white', 35)} strokeWidth="1" strokeDasharray="3 2" />}
        {c.bottom === 'joggers' && <rect x={x} y="264" width="17" height="8" rx="3" fill={mix(p, 'black', 20)} />}
      </g>
    );
  };
  const shoe = (x: number) => c.shoes === 'boots'
    ? <path key={x} d={`M${x - 1} 258 h18 v18 q8 0 10 6 v3 h-29 z`} fill={c.shoeColor} stroke={mix(c.shoeColor, 'black', 30)} strokeWidth="1.2" strokeLinejoin="round" />
    : (
      <g key={x}>
        <path d={`M${x - 2} 272 q0 -6 8 -6 h6 q10 0 14 8 v4 h-28 z`} fill={c.shoeColor} stroke={mix(c.shoeColor, 'black', 30)} strokeWidth="1.2" strokeLinejoin="round" />
        <rect x={x - 2} y="277" width="28" height="4" rx="2" fill="#f4f1ec" stroke={mix(c.shoeColor, 'black', 25)} strokeWidth="0.8" />
      </g>
    );
  return (
    <g>
      <g className="ch-leg ch-leg-l" style={{ transformOrigin: '90px 214px' }}>{legFill('l')}{shoe(82)}</g>
      <g className="ch-leg ch-leg-r" style={{ transformOrigin: '110px 214px' }}>{legFill('r')}{shoe(101)}</g>
      {!dress && c.bottom === 'shorts' && <path d="M68 206 H132 L134 238 H102 L100 224 L98 238 H66 Z" fill={p} stroke={mix(p, 'black', 22)} strokeWidth="1.2" strokeLinejoin="round" />}
      {!dress && c.bottom === 'skirt' && <path d="M68 206 H132 L144 246 Q100 254 56 246 Z" fill={p} stroke={mix(p, 'black', 22)} strokeWidth="1.2" strokeLinejoin="round" />}
      {!dress && <rect x="68" y="204" width="64" height="9" rx="3" fill={c.bottom === 'skirt' || c.bottom === 'shorts' ? mix(p, 'black', 12) : p} stroke={mix(p, 'black', 22)} strokeWidth="1" />}
    </g>
  );
};

const Arm: React.FC<{ c: CharacterConfig; side: 'l' | 'r' }> = ({ c, side }) => {
  const left = side === 'l';
  const sx = left ? 70 : 130;
  const t = c.topColor;
  const shortSleeve = c.top === 'tee' || c.top === 'dress';
  return (
    <g className={`ch-arm ch-arm-${side}`} style={{ transformOrigin: `${sx}px 152px` }}>
      <g transform={`rotate(${left ? 10 : -10} ${sx} 152)`}>
        {shortSleeve && <rect x={sx - 7} y="160" width="14" height="40" rx="7" fill={c.skin} stroke={mix(c.skin, 'black', 12)} strokeWidth="1" />}
        <rect x={sx - 8.5} y="148" width="17" height={shortSleeve ? 22 : 54} rx="8.5" fill={t} stroke={mix(t, 'black', 22)} strokeWidth="1.2" />
        {c.top === 'sweater' && <path d={`M${sx - 8} 192 h16`} stroke="white" strokeOpacity="0.55" strokeWidth="4" />}
        <circle cx={sx} cy="206" r="8.5" fill={c.skin} stroke={mix(c.skin, 'black', 14)} strokeWidth="1" />
      </g>
    </g>
  );
};

/* ---------- The character ---------- */

interface Props {
  config: CharacterConfig;
  /** Whole body, head-and-shoulders, or just the outfit. */
  crop?: 'full' | 'head' | 'body';
  pose?: CharacterPose;
  /** Override the face for a moment (e.g. ^ ^ while being poked). */
  joy?: boolean;
  className?: string;
}

export const CharacterArt: React.FC<Props> = ({ config: c, crop = 'full', pose = 'idle', joy, className }) => {
  const id = useId().replace(/:/g, '');
  const faceProps = { fill: c.skin, stroke: mix(c.skin, 'black', 12), strokeWidth: 1.2 };
  return (
    <svg viewBox={VIEW[crop]} className={cn('ch overflow-visible', `ch-${pose}`, className)} aria-hidden>
      <defs>
        <radialGradient id={`iris${id}`} cx="0.5" cy="0.62" r="0.6">
          <stop offset="0" stopColor={mix(c.eyeColor, 'white', 25)} />
          <stop offset="0.7" stopColor={c.eyeColor} />
          <stop offset="1" stopColor="#1a110c" />
        </radialGradient>
      </defs>

      {crop !== 'head' && <ellipse cx="100" cy="286" rx="46" ry="6" fill="black" opacity="0.14" className="ch-shadow" />}

      <g className="ch-all">
        {hairBack(c)}

        {crop !== 'head' && (
          <g className="ch-body">
            <LegsArt c={c} />
            <rect x="92" y="126" width="16" height="22" rx="6" fill={mix(c.skin, 'black', 8)} />
            <TopArt c={c} id={id} />
            <Arm c={c} side="l" />
            <Arm c={c} side="r" />
          </g>
        )}
        {crop === 'head' && (
          <g>
            <rect x="92" y="126" width="16" height="22" rx="6" fill={mix(c.skin, 'black', 8)} />
            <TopArt c={c} id={id} />
          </g>
        )}

        <g className="ch-head" style={{ transformOrigin: '100px 136px' }}>
          {/* Ears and earrings */}
          {[54, 146].map(x => (
            <g key={x}>
              <ellipse cx={x} cy="100" rx="7" ry="10" {...faceProps} />
              {c.earrings === 'studs' && <circle cx={x} cy="111" r="2.6" fill="#9fd4ff" stroke="white" strokeWidth="0.8" />}
              {c.earrings === 'hoops' && <circle cx={x} cy="116" r="5" fill="none" stroke="#f5c542" strokeWidth="1.8" />}
            </g>
          ))}
          {c.face === 'heart'
            ? <path d="M54 90 C54 58 74 46 100 46 C126 46 146 58 146 90 C146 114 126 136 100 140 C74 136 54 114 54 90Z" {...faceProps} />
            : <ellipse cx="100" cy={c.face === 'oval' ? 94 : 93} rx={c.face === 'oval' ? 43 : 46} ry={c.face === 'oval' ? 47 : 44} {...faceProps} />}

          {hairFront(c)}
          <path d="M76 52 q14 -8 30 -6" stroke="white" strokeOpacity="0.28" strokeWidth="3" fill="none" strokeLinecap="round" />

          {c.blush && <g fill="#ff9fb1" opacity="0.5"><ellipse cx="72" cy="110" rx="7" ry="4" /><ellipse cx="128" cy="110" rx="7" ry="4" /></g>}
          {c.freckles && <g fill={mix(c.skin, 'black', 35)}>{[[70, 104], [75, 107], [66, 108], [130, 104], [125, 107], [134, 108]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" />)}</g>}

          <Brows c={c} />
          <Eyes c={c} id={id} force={joy ? 'happy' : undefined} />
          <path d="M98 106 q2 2 4 0" stroke={mix(c.skin, 'black', 25)} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <Mouth c={c} force={joy ? 'grin' : undefined} />
          <GlassesArt kind={c.glasses} />
          <HeadwearArt c={c} />
        </g>
      </g>
    </svg>
  );
};
