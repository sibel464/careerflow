import React, { useId } from 'react';
import type { Species, TraitId } from '../../Utils/pet';

const mix = (c: string, to: string, pct: number) => `color-mix(in srgb, ${c}, ${to} ${pct}%)`;

/** Is this fur dark enough that green eyes and light whiskers look better? */
const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 < 110;
};

/** Two strokes — outline, then fur — so a curved tail gets the same sticker edge as the body. */
const Stroke: React.FC<{ d: string; width: number; fill: string; line: string }> = ({ d, width, fill, line }) => (
  <>
    <path d={d} fill="none" stroke={line} strokeWidth={width + 3} strokeLinecap="round" />
    <path d={d} fill="none" stroke={fill} strokeWidth={width} strokeLinecap="round" />
  </>
);

interface Props { species: Species; color: string; pose: string; traits?: TraitId[] }

/** Soft, round, big-eyed little animals — sticker style, drawn in SVG. Poses come from `pose`. */
export const CuteAnimal: React.FC<Props> = ({ species, color, pose, traits = [] }) => {
  const has = (t: TraitId) => traits.includes(t);
  // One thing on the head at a time: night cap beats sunglasses beats the flower crown.
  const hat = has('night') ? 'night' : has('early') ? 'early' : has('streak') ? 'streak' : null;
  const id = useId().replace(/:/g, '');
  const dark = isDark(color);
  const line = mix(color, 'black', dark ? 45 : 32);
  const shade = mix(color, 'black', 14);
  const light = mix(color, 'white', dark ? 30 : 60);
  const cream = '#fff7ee';
  const inner = '#f6b3bd';
  const iris = species === 'dog' ? '#6b4426' : dark ? '#7fb35a' : species === 'bunny' ? '#8a5a3b' : '#d39a2e';
  const loaf = pose === 'sit' || pose === 'sleep';
  const eyesClosed = pose === 'sleep';
  const joyful = pose === 'happy' || pose === 'eat';
  const blackNose = species === 'dog' || species === 'fox';
  const muzzle = species === 'fox' ? cream : light;

  // Head sits lower when loafing, dips toward the bowl when eating.
  const head = loaf ? 'translate(0 16)' : pose === 'eat' ? 'translate(4 13) rotate(10 102 62)' : undefined;

  const ears = {
    cat: (
      <>
        <g className="cc-ear-l">
          <path d="M77 49 C 74 38, 74 27, 79 21 C 86 25, 93 32, 97 39 Z" fill={color} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M80 44 C 79 37, 79 31, 81 27 C 85 30, 89 34, 91 39 Z" fill={inner} />
        </g>
        <g className="cc-ear-r">
          <path d="M108 38 C 113 31, 120 25, 127 22 C 130 29, 130 39, 127 48 Z" fill={color} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M112 39 C 116 34, 120 30, 125 28 C 126 33, 126 38, 124 43 Z" fill={inner} />
        </g>
      </>
    ),
    fox: (
      <>
        <g className="cc-ear-l">
          <path d="M75 52 C 71 38, 71 22, 76 12 C 85 18, 94 28, 99 38 Z" fill={color} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M79 46 C 77 36, 77 27, 79 20 C 85 25, 90 31, 93 38 Z" fill={cream} />
          <path d="M76 12 C 74 17, 73 22, 73 26 L 81 18 Z" fill="#3a2a22" />
        </g>
        <g className="cc-ear-r">
          <path d="M106 38 C 112 28, 121 18, 131 12 C 134 22, 134 37, 130 51 Z" fill={color} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M110 39 C 115 32, 121 25, 128 20 C 130 27, 130 37, 127 45 Z" fill={cream} />
          <path d="M131 12 C 129 14, 126 17, 124 19 L 133 24 C 133 19, 132 15, 131 12 Z" fill="#3a2a22" />
        </g>
      </>
    ),
    bunny: (
      <>
        <g className="cc-ear-l">
          <ellipse cx="88" cy="18" rx="8" ry="22" transform="rotate(-14 88 38)" fill={color} stroke={line} strokeWidth="1.6" />
          <ellipse cx="88" cy="20" rx="4" ry="16" transform="rotate(-14 88 38)" fill={inner} />
        </g>
        <g className="cc-ear-r">
          <ellipse cx="113" cy="16" rx="8" ry="23" transform="rotate(12 113 38)" fill={color} stroke={line} strokeWidth="1.6" />
          <ellipse cx="113" cy="18" rx="4" ry="17" transform="rotate(12 113 38)" fill={inner} />
        </g>
      </>
    ),
    dog: null,
  }[species];

  /** Dog ears flop over the sides of the head, so they're drawn after it. */
  const dogEars = species === 'dog' && (
    <>
      <g className="cc-ear-l">
        <path d="M80 42 C 70 44, 64 58, 68 74 C 70 82, 78 82, 80 74 C 82 64, 84 52, 86 44 Z" fill={shade} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      <g className="cc-ear-r">
        <path d="M120 40 C 131 41, 138 55, 135 71 C 133 79, 125 80, 123 72 C 121 62, 119 50, 116 42 Z" fill={shade} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    </>
  );

  const tail = loaf ? {
    cat: <Stroke d="M44 104 C 30 104, 30 116, 52 116 C 70 116, 84 114, 92 110" width={9.5} fill={color} line={line} />,
    dog: <Stroke d="M42 102 C 32 104, 34 114, 50 115" width={8.5} fill={color} line={line} />,
    bunny: <circle cx="38" cy="102" r="9" fill={cream} stroke={line} strokeWidth="1.4" />,
    fox: (
      <g>
        <Stroke d="M44 102 C 26 102, 26 116, 52 117 C 70 117, 84 115, 92 110" width={15} fill={color} line={line} />
        <Stroke d="M84 113.5 C 88 112.5, 90 111.5, 92 110" width={14} fill={cream} line={cream} />
      </g>
    ),
  }[species] : {
    cat: (
      <g className="cc-tail">
        <Stroke d="M46 88 C 26 88, 18 70, 24 56 C 28 47, 37 48, 35 56" width={9.5} fill={color} line={line} />
        <path d="M27 54 C 30 49, 35 50, 35 56" fill="none" stroke={shade} strokeWidth="9" strokeLinecap="round" opacity="0.6" />
      </g>
    ),
    dog: <g className="cc-tail cc-wag"><Stroke d="M44 86 C 34 82, 30 72, 33 62" width={8.5} fill={color} line={line} /></g>,
    bunny: <g className="cc-tail"><circle cx="41" cy="84" r="9.5" fill={cream} stroke={line} strokeWidth="1.4" /></g>,
    fox: (
      <g className="cc-tail">
        <path d="M48 90 C 26 98, 6 84, 12 58 C 22 62, 36 72, 48 80 Z" fill={color} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 58 C 11 64, 12 70, 15 74 C 19 69, 21 64, 21 61 C 18 60, 15 59, 12 58 Z" fill={cream} />
      </g>
    ),
  }[species];

  return (
    <svg viewBox="0 0 140 120" className="w-full h-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`fur${id}`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" style={{ stopColor: mix(color, 'white', 18) }} />
          <stop offset="0.65" style={{ stopColor: color }} />
          <stop offset="1" style={{ stopColor: shade }} />
        </radialGradient>
        <radialGradient id={`eye${id}`} cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor={iris} />
          <stop offset="0.75" stopColor={mix(iris, 'black', 35)} />
          <stop offset="1" stopColor="#24170f" />
        </radialGradient>
      </defs>

      <ellipse className="cc-shadow" cx="72" cy="115" rx={loaf ? 44 : 38} ry="4" fill="black" opacity="0.16" />

      {tail}

      {/* Far legs */}
      {!loaf && (
        <g>
          <g className="cc-leg cc-b"><rect x="49" y="96" width="12" height="17" rx="6" fill={shade} stroke={line} strokeWidth="1.4" /></g>
          <g className="cc-leg cc-a"><rect x="83" y="96" width="12" height="17" rx="6" fill={shade} stroke={line} strokeWidth="1.4" /></g>
        </g>
      )}

      {/* Body */}
      <g className="cc-body">
        {loaf ? (
          <ellipse cx="72" cy="100" rx="36" ry="17" fill={`url(#fur${id})`} stroke={line} strokeWidth="1.6" />
        ) : (
          <ellipse cx="70" cy="89" rx="30" ry="19" fill={`url(#fur${id})`} stroke={line} strokeWidth="1.6" />
        )}
        <ellipse cx={loaf ? 80 : 78} cy={loaf ? 107 : 97} rx="17" ry="7" fill={species === 'fox' ? cream : light} opacity="0.85" />
        {species === 'cat' && (
          <g stroke={line} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity={dark ? 0.35 : 0.3} transform={loaf ? 'translate(0 11)' : undefined}>
            <path d="M58 72 q2 5 0 9" /><path d="M66 71 q2 5 0 9" /><path d="M74 72 q2 4 0 8" />
          </g>
        )}
        {species === 'dog' && <ellipse cx="62" cy={loaf ? 95 : 82} rx="9" ry="6" fill={shade} opacity="0.5" />}
      </g>

      {/* Near legs */}
      {!loaf && (
        <g>
          <g className="cc-leg cc-a">
            <rect x="56" y="97" width="13" height="17" rx="6.5" fill={color} stroke={line} strokeWidth="1.4" />
            <ellipse cx="62.5" cy="112" rx="6" ry="2.6" fill={light} />
          </g>
          <g className="cc-leg cc-b">
            <rect x="90" y="97" width="13" height="17" rx="6.5" fill={species === 'fox' ? '#4a3329' : color} stroke={line} strokeWidth="1.4" />
            <ellipse cx="96.5" cy="112" rx="6" ry="2.6" fill={species === 'fox' ? '#4a3329' : light} />
            {has('marathon') && <rect x="88.5" y="102" width="16" height="4.6" rx="2.3" fill="#ff7a59" stroke="#c9503a" strokeWidth="0.8" />}
          </g>
        </g>
      )}
      {loaf && (
        <g>
          <ellipse cx="96" cy="113" rx="7.5" ry="4" fill={species === 'fox' ? '#4a3329' : color} stroke={line} strokeWidth="1.3" />
          <ellipse cx="108" cy="113" rx="7.5" ry="4" fill={species === 'fox' ? '#4a3329' : color} stroke={line} strokeWidth="1.3" />
          <path d="M94 113 v2 M98 113 v2 M106 113 v2 M110 113 v2" stroke={line} strokeWidth="0.9" strokeLinecap="round" />
        </g>
      )}

      {/* Head */}
      <g className="cc-head" transform={head}>
        {ears}

        {/* Round fluffy head with cheek tufts (bunnies and dogs get a smooth round one) */}
        {species === 'cat' || species === 'fox' ? (
          <path
            d="M70 62 C 70 44, 85 34, 102 34 C 120 34, 134 46, 134 63 C 134 70, 132 75, 129 79 L 133 82 L 126 83 C 119 89, 110 91, 102 91 C 93 91, 84 89, 77 83 L 70 83 L 74 79 C 71 74, 70 68, 70 62 Z"
            fill={`url(#fur${id})`} stroke={line} strokeWidth="1.6" strokeLinejoin="round"
          />
        ) : (
          <ellipse cx="102" cy="63" rx="32" ry="28" fill={`url(#fur${id})`} stroke={line} strokeWidth="1.6" />
        )}
        {species === 'fox' && (
          <path d="M72 70 C 80 78, 90 86, 102 88 C 114 86, 124 78, 132 70 C 128 82, 116 91, 102 91 C 88 91, 76 82, 72 70 Z" fill={cream} />
        )}
        {species === 'cat' && (
          <g stroke={line} strokeWidth="2.2" strokeLinecap="round" opacity={dark ? 0.35 : 0.32} fill="none">
            <path d="M98 38 v6" /><path d="M104 37 v7" /><path d="M110 38 v6" />
          </g>
        )}
        {species === 'dog' && <ellipse cx="114" cy="50" rx="9" ry="7" fill={shade} opacity="0.45" />}
        {dogEars}

        {/* Muzzle and blush */}
        <ellipse cx="106" cy="76" rx="13" ry="8.5" fill={muzzle} opacity="0.92" />
        <ellipse cx="85" cy="76" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.38" />
        <ellipse cx="126" cy="75" rx="5" ry="3.2" fill="#ff8fa3" opacity="0.38" />

        {/* Eyes */}
        {eyesClosed ? (
          <g stroke="#2b1d16" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M85 64 q5 4.5 10 0" /><path d="M110 63 q5 4.5 10 0" />
          </g>
        ) : joyful ? (
          <g stroke="#2b1d16" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M85 66 q5 -6 10 0" /><path d="M110 65 q5 -6 10 0" />
          </g>
        ) : (
          <g className="cc-eyes">
            <ellipse cx="90" cy="63" rx="7" ry="8.2" fill={`url(#eye${id})`} />
            <ellipse cx="90" cy="64" rx="3.6" ry="5.4" fill="#1a110c" />
            <circle cx="92.6" cy="59.5" r="2.6" fill="white" />
            <circle cx="87.4" cy="67" r="1.2" fill="white" opacity="0.85" />
            <ellipse cx="115" cy="62" rx="6.6" ry="7.8" fill={`url(#eye${id})`} />
            <ellipse cx="115" cy="63" rx="3.4" ry="5.2" fill="#1a110c" />
            <circle cx="117.4" cy="58.7" r="2.4" fill="white" />
            <circle cx="112.6" cy="66" r="1.1" fill="white" opacity="0.85" />
          </g>
        )}

        {/* Nose and mouth */}
        {blackNose ? (
          <ellipse cx="104" cy="71.5" rx="4.6" ry="3.2" fill="#2b1d16" />
        ) : (
          <path d="M100.5 71.5 Q 104 69.5 107.5 71.5 Q 104.5 75.5 104 75.5 Q 103.5 75.5 100.5 71.5 Z" fill="#f48b9d" stroke={mix('#f48b9d', 'black', 25)} strokeWidth="0.6" />
        )}
        {blackNose && <circle cx="102.6" cy="70.6" r="1.1" fill="white" opacity="0.7" />}
        {pose === 'happy' ? (
          <g>
            <path d="M98.5 77 Q 104 84 109.5 77 Z" fill="#c85a6a" stroke="#2b1d16" strokeWidth="1" strokeLinejoin="round" />
            {species === 'dog' && <path d="M101.5 79.5 Q 104 88 106.5 79.5 Z" fill="#f2849a" stroke="#c85a6a" strokeWidth="0.8" />}
          </g>
        ) : (
          <path d="M104 75 v1.8 M104 76.8 q-2.5 3 -5 0.5 M104 76.8 q2.5 3 5 0.5" stroke="#2b1d16" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        )}
        {species === 'bunny' && pose !== 'happy' && (
          <g>
            <rect x="101.6" y="78.2" width="2.4" height="3.4" rx="0.6" fill="white" stroke="#c9b9ad" strokeWidth="0.5" />
            <rect x="104" y="78.2" width="2.4" height="3.4" rx="0.6" fill="white" stroke="#c9b9ad" strokeWidth="0.5" />
          </g>
        )}

        {/* Whiskers */}
        {(species === 'cat' || species === 'bunny') && (
          <g stroke={dark ? '#f3ece4' : mix(color, 'black', 50)} strokeWidth="0.9" strokeLinecap="round" opacity="0.75">
            <path d="M80 75 L 66 72" /><path d="M80 78 L 66 79" />
            <path d="M128 74 L 140 70" /><path d="M128 77 L 141 77" />
          </g>
        )}

        {/* 🧬 Looks it picked up from your habits */}
        {has('night') && !eyesClosed && !joyful && (
          <g stroke="#9b7fd1" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55">
            <path d="M84 72.5 q6 3 12 0" /><path d="M109 71.5 q6 3 12 0" />
          </g>
        )}
        {has('bookworm') && (
          <g fill="white" fillOpacity="0.14" stroke="#3a2a22" strokeWidth="1.7">
            <circle cx="90" cy="63" r="10.5" /><circle cx="115" cy="62" r="10" />
            <path d="M100.5 62.5 q2.2 -2.5 4.5 0" fill="none" />
            <path d="M79.5 61.5 L 72 58" fill="none" />
          </g>
        )}
        {has('tasks') && (
          <g>
            <path d="M80 85 Q 102 95 124 85" fill="none" stroke="#d64545" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="102" cy="93.5" r="4.6" fill="#f5c542" stroke="#c9962a" strokeWidth="0.9" />
            <path d="M102 90.6 l0.9 1.9 2 0.2 -1.5 1.4 0.4 2 -1.8 -1 -1.8 1 0.4 -2 -1.5 -1.4 2 -0.2 z" fill="#fff6d5" />
          </g>
        )}
        {hat === 'night' && (
          <g>
            <path d="M80 41 C 84 22, 104 12, 124 16 C 132 18, 136 26, 134 34 C 128 26, 120 24, 114 26 C 110 30, 108 36, 108 40 Z" fill="#5b6fd6" stroke="#3d4fa8" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M92 30 C 98 26, 106 22, 114 22 M98 36 C 104 31, 110 28, 118 27" stroke="#dfe5ff" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M78 42 Q 94 34 110 40" stroke="#eef1ff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <circle cx="135" cy="36" r="5" fill="#ffffff" stroke="#c9cfe8" strokeWidth="1" />
          </g>
        )}
        {hat === 'early' && (
          <g>
            <path d="M84 37 h16 a2 2 0 0 1 2 2 v4 a6 6 0 0 1 -6 6 h-6 a6 6 0 0 1 -6 -6 v-4 a2 2 0 0 1 2 -2 z" fill="#2b2b3a" />
            <path d="M106 36 h16 a2 2 0 0 1 2 2 v4 a6 6 0 0 1 -6 6 h-6 a6 6 0 0 1 -6 -6 v-4 a2 2 0 0 1 2 -2 z" fill="#2b2b3a" />
            <path d="M102 40 h4" stroke="#2b2b3a" strokeWidth="2" />
            <path d="M86 40 l5 4 M108 39 l5 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
          </g>
        )}
        {hat === 'streak' && (
          <g>
            <path d="M78 42 Q 102 30 128 40" fill="none" stroke="#6aa84f" strokeWidth="2" />
            {[[80, 41, '#ff9ec4'], [89, 37, '#fff3a6'], [98, 35, '#ffb3a7'], [107, 34.5, '#ffffff'], [116, 35.5, '#ff9ec4'], [125, 39, '#fff3a6']].map(([x, y, c]) => (
              <g key={`${x}`} transform={`translate(${x} ${y})`}>
                {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-3" rx="2.2" ry="3" fill={c as string} stroke="#e58aa9" strokeWidth="0.4" transform={`rotate(${a})`} />)}
                <circle r="1.5" fill="#f5b942" />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};
