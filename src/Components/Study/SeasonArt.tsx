import React from 'react';

/** Hand-drawn, flat boho scenes for the top of the wall calendar — one per season. */
export const SeasonArt: React.FC<{ month: number }> = ({ month }) => {
  const season = month === 11 || month <= 1 ? 'winter' : month <= 4 ? 'spring' : month <= 7 ? 'summer' : 'autumn';
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden>
      {season === 'winter' && (
        <g>
          <rect width="400" height="150" fill="#dfe8ef" />
          <circle cx="320" cy="40" r="20" fill="#f6f1e6" />
          <path d="M0 95 Q 80 70 170 92 T 400 84 V150 H0Z" fill="#c9d6e0" />
          <path d="M0 118 Q 110 96 220 116 T 400 110 V150 H0Z" fill="#f7f9fb" />
          {[[60, 96], [86, 104], [300, 92], [326, 100], [350, 95]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 -34 L 13 -6 L -13 -6 Z M0 -22 L 16 6 L -16 6 Z" fill="#5f7d6e" />
              <path d="M0 -34 L 6 -21 L -6 -21 Z" fill="#fff" opacity="0.85" />
              <rect x="-2.5" y="6" width="5" height="7" fill="#7a5a44" />
            </g>
          ))}
          {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={(i * 47) % 400} cy={(i * 29) % 90 + 6} r={i % 3 === 0 ? 2.4 : 1.6} fill="#fff" />)}
          <g transform="translate(200 120)">
            <circle cy="-26" r="10" fill="#fff" stroke="#c9d6e0" /><circle r="15" fill="#fff" stroke="#c9d6e0" />
            <circle cx="-3" cy="-28" r="1.3" fill="#3b2f2a" /><circle cx="3" cy="-28" r="1.3" fill="#3b2f2a" />
            <path d="M0 -25 l7 2 l-7 1z" fill="#e0884a" />
            <path d="M-9 -17 q9 5 18 0" stroke="#c97b5a" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}
      {season === 'spring' && (
        <g>
          <rect width="400" height="150" fill="#f4ead8" />
          <circle cx="60" cy="42" r="22" fill="#e9b949" />
          <path d="M0 92 Q 90 62 190 88 T 400 76 V150 H0Z" fill="#b8c9a0" />
          <path d="M0 115 Q 120 92 240 112 T 400 106 V150 H0Z" fill="#94ad7e" />
          {[[300, 78], [340, 70]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 3} y={y} width="6" height="34" fill="#8a6247" />
              {[[-14, -6], [0, -14], [14, -6], [-8, 6], [8, 6]].map(([dx, dy], j) => <circle key={j} cx={x + dx} cy={y + dy} r="11" fill={j % 2 ? '#f2b8c6' : '#f7cdd6'} />)}
            </g>
          ))}
          {Array.from({ length: 14 }, (_, i) => {
            const x = 20 + i * 27; const y = 120 + (i % 3) * 8;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d="M0 0 v10" stroke="#5f7d4e" strokeWidth="1.6" />
                {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-4" rx="2.6" ry="4" fill={['#fffaf2', '#f2b8c6', '#e9b949'][i % 3]} transform={`rotate(${a})`} />)}
                <circle r="1.8" fill="#c97b5a" />
              </g>
            );
          })}
          <path d="M150 40 q6 -6 12 0 q6 -6 12 0" stroke="#5a4a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M190 28 q5 -5 10 0 q5 -5 10 0" stroke="#5a4a3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )}
      {season === 'summer' && (
        <g>
          <rect width="400" height="150" fill="#f6e3c4" />
          <circle cx="300" cy="62" r="34" fill="#e7a548" />
          <circle cx="300" cy="62" r="24" fill="#f0bd5a" />
          <rect y="88" width="400" height="30" fill="#7fb3b5" />
          <path d="M0 92 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#e6f1ef" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M0 114 Q 130 104 260 116 T 400 112 V150 H0Z" fill="#ead2a6" />
          <g transform="translate(120 86)">
            <path d="M-22 0 h44 l-8 9 h-28z" fill="#c97b5a" />
            <path d="M0 0 v-30 l18 26 z" fill="#fffaf2" /><path d="M-2 0 v-24 l-14 22 z" fill="#f4d9b0" />
          </g>
          <g transform="translate(60 128)">
            <path d="M0 0 L 30 -36" stroke="#8a6247" strokeWidth="2" />
            <path d="M30 -36 a26 14 0 0 0 -50 6 z" fill="#c97b5a" /><path d="M30 -36 a26 14 0 0 0 -24 -2 z" fill="#f6efe4" />
          </g>
          <circle cx="345" cy="132" r="5" fill="#f2b8c6" /><path d="M335 136 l20 -6" stroke="#fffaf2" strokeWidth="2" />
        </g>
      )}
      {season === 'autumn' && (
        <g>
          <rect width="400" height="150" fill="#f3e2c9" />
          <circle cx="330" cy="40" r="18" fill="#e7a548" opacity="0.85" />
          <path d="M0 90 Q 90 64 200 88 T 400 78 V150 H0Z" fill="#d9a56b" />
          <path d="M0 116 Q 120 94 240 114 T 400 106 V150 H0Z" fill="#b8744a" />
          {[[70, 70, '#c97b5a'], [110, 78, '#e0a14a'], [260, 72, '#b0523a']].map(([x, y, c], i) => (
            <g key={i}>
              <rect x={(x as number) - 3} y={y as number} width="6" height="36" fill="#6e4a33" />
              <circle cx={x as number} cy={(y as number) - 8} r="20" fill={c as string} />
              <circle cx={(x as number) - 10} cy={(y as number) + 2} r="12" fill={c as string} />
              <circle cx={(x as number) + 11} cy={(y as number)} r="13" fill={c as string} />
            </g>
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M0 0 C 4 -6 10 -6 12 0 C 10 6 4 6 0 0Z" fill={['#c97b5a', '#e0a14a', '#b0523a'][i % 3]}
              transform={`translate(${(i * 37 + 15) % 400} ${(i * 23) % 70 + 10}) rotate(${i * 40})`} />
          ))}
          <g transform="translate(180 126)">
            <ellipse rx="16" ry="12" fill="#e0884a" /><ellipse rx="6" ry="12" fill="#c96f36" opacity="0.6" />
            <path d="M0 -12 q2 -6 6 -7" stroke="#5f7d4e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(212 130)">
            <ellipse rx="11" ry="8" fill="#e9b949" /><path d="M0 -8 q1 -4 4 -5" stroke="#5f7d4e" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}
    </svg>
  );
};
