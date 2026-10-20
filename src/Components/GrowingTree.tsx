import React from 'react';

/** Canopy blobs, drawn in order — higher levels reveal more of them. */
const CANOPY: [number, number, number, string][] = [
  [150, 118, 46, '#2c5e4a'],
  [112, 132, 36, '#3d7a62'],
  [188, 132, 36, '#3d7a62'],
  [128, 92, 36, '#3f8a6b'],
  [172, 92, 36, '#3f8a6b'],
  [150, 70, 34, '#52a382'],
  [96, 104, 28, '#52a382'],
  [204, 104, 28, '#52a382'],
  [150, 146, 34, '#2c5e4a'],
];

const FLOWERS: [number, number][] = [[118, 96], [176, 78], [150, 52], [98, 128], [200, 120], [140, 128], [182, 146], [124, 64]];
const FRUITS: [number, number][] = [[132, 140], [170, 112], [106, 112], [192, 96], [150, 96], [162, 150]];

const SCALE: Record<number, number> = { 3: 0.62, 4: 0.82, 5: 1, 6: 1 };
const BLOBS: Record<number, number> = { 3: 5, 4: 7, 5: 9, 6: 9 };

interface GrowingTreeProps {
  level: number;
  className?: string;
  /** Only the tree itself, for placing inside another scene. */
  bare?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const GrowingTree: React.FC<GrowingTreeProps> = ({ level, className, bare, x, y, width, height }) => (
  <svg viewBox="0 0 300 300" x={x} y={y} width={width} height={height} className={className} role="img" aria-label={`Kariyer ağacın — seviye ${level + 1}`}>
    <defs>
      <radialGradient id="tree-sun" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#fbdca9" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#fbdca9" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tree-soil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8a5a3c" />
        <stop offset="100%" stopColor="#5c3a24" />
      </linearGradient>
    </defs>

    {!bare && <circle cx="150" cy="130" r="130" fill="url(#tree-sun)" className="animate-[pulse_6s_ease-in-out_infinite] dark:opacity-30" />}

    {/* Ground */}
    {!bare && <>
    <ellipse cx="150" cy="272" rx="110" ry="18" fill="url(#tree-soil)" />
    <ellipse cx="150" cy="266" rx="104" ry="12" fill="#6b8f4e" />
    {[70, 92, 205, 228].map(x => (
      <path key={x} d={`M${x} 266 q2 -10 4 0 M${x + 6} 266 q2 -8 4 0`} stroke="#4f7a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
    ))}
    </>}

    {level === 0 && (
      <g className="tree-pop">
        <ellipse cx="150" cy="262" rx="13" ry="9" fill="#8a5a3c" />
        <path d="M146 257 q4 -6 8 0" stroke="#c9a27a" strokeWidth="2" fill="none" />
        <text x="185" y="240" fontSize="18">✨</text>
      </g>
    )}

    {level === 1 && (
      <g className="tree-pop"><g className="tree-sway">
        <path d="M150 266 C150 250 148 240 150 224" stroke="#5a8f4e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M150 236 C136 230 128 222 130 212 C142 214 150 224 150 236Z" fill="#6fb06a" />
        <path d="M150 230 C164 224 172 214 170 204 C158 206 150 218 150 230Z" fill="#52a382" />
      </g></g>
    )}

    {level === 2 && (
      <g className="tree-pop"><g className="tree-sway">
        <path d="M150 266 C152 236 146 212 150 176" stroke="#6b4c3a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M150 220 C134 214 122 204 124 190 C140 192 150 206 150 220Z" fill="#6fb06a" />
        <path d="M150 206 C166 200 178 188 176 174 C160 176 150 192 150 206Z" fill="#52a382" />
        <path d="M150 186 C138 178 132 166 136 154 C148 160 152 172 150 186Z" fill="#3f8a6b" />
        <path d="M150 180 C162 172 168 160 164 148 C152 154 148 166 150 180Z" fill="#6fb06a" />
      </g></g>
    )}

    {level >= 3 && (
      <g style={{ transformBox: 'view-box', transformOrigin: '150px 268px', transform: `scale(${SCALE[level]})` }}>
      <g className="tree-pop">
        {/* Trunk & branches */}
        <path d="M138 268 C142 230 140 190 146 150 L154 150 C160 190 158 230 162 268 Z" fill="#6b4c3a" />
        <path d="M146 196 C130 184 118 170 112 150" stroke="#6b4c3a" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M154 184 C168 172 180 160 188 144" stroke="#6b4c3a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M143 240 q-4 -12 2 -24" stroke="#4a3f35" strokeOpacity="0.35" strokeWidth="2" fill="none" />

        <g className="tree-sway">
          {CANOPY.slice(0, BLOBS[level]).map(([cx, cy, r, fill], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity="0.96" />
          ))}
          {/* Soft highlights give the canopy some volume */}
          <circle cx="132" cy="84" r="14" fill="#ffffff" opacity="0.08" />
          <circle cx="168" cy="66" r="10" fill="#ffffff" opacity="0.08" />

          {level >= 5 && FLOWERS.map(([x, y], i) => (
            <g key={`f${i}`} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="0" cy="-4" rx="2.6" ry="4" fill="#f4b8c8" transform={`rotate(${a})`} />
              ))}
              <circle r="2" fill="#e8b923" />
            </g>
          ))}
          {level >= 6 && FRUITS.map(([x, y], i) => (
            <g key={`a${i}`}>
              <circle cx={x} cy={y} r="7" fill="#c0392b" />
              <circle cx={x - 2} cy={y - 2} r="2" fill="#ffffff" opacity="0.5" />
              <path d={`M${x} ${y - 7} q2 -4 5 -4`} stroke="#4f7a3a" strokeWidth="1.5" fill="none" />
            </g>
          ))}
        </g>
      </g>
      </g>
    )}
  </svg>
);
