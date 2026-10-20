/** Hand-drawn wallpaper tiles for the room behind everything. Warm boho tones, independent of the palette. */
export type Wall = 'boho' | 'floral' | 'stripes' | 'gingham' | 'terrazzo' | 'plain';

const T = '#c97b5a'; // terracotta
const M = '#d9a441'; // mustard
const S = '#9aae8c'; // sage
const P = '#e3b5a4'; // dusty pink
const B = '#b8916a'; // dried grass

const rainbow = (x: number, y: number, r: number, rot = 0) => `
  <g transform="rotate(${rot} ${x} ${y})" fill="none" stroke-linecap="butt">
    <path d="M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}" stroke="${T}" stroke-width="${r * 0.24}"/>
    <path d="M${x - r * 0.72} ${y} A${r * 0.72} ${r * 0.72} 0 0 1 ${x + r * 0.72} ${y}" stroke="${M}" stroke-width="${r * 0.24}"/>
    <path d="M${x - r * 0.44} ${y} A${r * 0.44} ${r * 0.44} 0 0 1 ${x + r * 0.44} ${y}" stroke="${S}" stroke-width="${r * 0.24}"/>
  </g>`;

const sun = (x: number, y: number, r: number, c = M) => `
  <g stroke="${c}" stroke-width="2" stroke-linecap="round">
    ${Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return `<line x1="${(x + Math.cos(a) * r * 1.45).toFixed(1)}" y1="${(y + Math.sin(a) * r * 1.45).toFixed(1)}" x2="${(x + Math.cos(a) * r * 2).toFixed(1)}" y2="${(y + Math.sin(a) * r * 2).toFixed(1)}"/>`;
    }).join('')}
  </g>
  <circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;

const pampas = (x: number, y: number, rot: number) => `
  <g transform="rotate(${rot} ${x} ${y})" stroke="${B}" stroke-linecap="round" fill="none">
    <path d="M${x} ${y} Q${x + 2} ${y - 22} ${x} ${y - 44}" stroke-width="1.6"/>
    ${Array.from({ length: 7 }, (_, i) => {
      const yy = y - 10 - i * 5;
      return `<path d="M${x} ${yy} q-7 -3 -10 -9" stroke-width="1.2"/><path d="M${x} ${yy} q7 -3 10 -9" stroke-width="1.2"/>`;
    }).join('')}
  </g>`;

const daisy = (x: number, y: number, r: number, petal = '#fffaf2', center = M) => `
  <g>
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.42}" ry="${r * 0.8}" fill="${petal}" transform="rotate(${i * 45} ${x} ${y})"/>`).join('')}
    <circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${center}"/>
  </g>`;

const sprig = (x: number, y: number, rot: number, c = S) => `
  <g transform="rotate(${rot} ${x} ${y})" fill="${c}">
    <path d="M${x} ${y} L${x} ${y - 26}" stroke="${c}" stroke-width="1.4"/>
    <ellipse cx="${x - 5}" cy="${y - 8}" rx="5" ry="2.6" transform="rotate(-30 ${x - 5} ${y - 8})"/>
    <ellipse cx="${x + 5}" cy="${y - 15}" rx="5" ry="2.6" transform="rotate(30 ${x + 5} ${y - 15})"/>
    <ellipse cx="${x - 4}" cy="${y - 22}" rx="4.5" ry="2.4" transform="rotate(-30 ${x - 4} ${y - 22})"/>
  </g>`;

const TILES: Record<Exclude<Wall, 'plain'>, { size: number; bg: string; svg: string }> = {
  boho: {
    size: 220,
    bg: '#f3e7d9',
    svg: `${rainbow(58, 78, 34)}${sun(170, 168, 9)}${pampas(36, 206, -14)}${rainbow(172, 52, 18, 8)}${sprig(112, 150, 18)}
      <circle cx="120" cy="40" r="3" fill="${P}"/><circle cx="20" cy="120" r="2.5" fill="${T}" opacity=".7"/><circle cx="200" cy="110" r="2.5" fill="${S}"/>
      <circle cx="96" cy="206" r="3" fill="${P}"/><path d="M128 100 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="${M}" opacity=".8"/>`,
  },
  floral: {
    size: 140,
    bg: '#f6e4de',
    svg: `${daisy(34, 36, 9)}${daisy(104, 98, 7, '#fff6ef', T)}${sprig(98, 40, 24)}${sprig(30, 120, -20)}
      <circle cx="70" cy="70" r="2.5" fill="${T}" opacity=".6"/><circle cx="128" cy="20" r="2" fill="${S}"/><circle cx="12" cy="80" r="2" fill="${M}"/>`,
  },
  stripes: {
    size: 72,
    bg: '#f1e5d5',
    svg: `<rect x="0" y="0" width="24" height="72" fill="#e8d6c0"/><line x1="30" y1="0" x2="30" y2="72" stroke="#dcc3a6" stroke-width="1.5"/>
      <line x1="66" y1="0" x2="66" y2="72" stroke="#dcc3a6" stroke-width="1.5"/>
      ${daisy(48, 20, 4.5, '#fffaf2', T)}${sprig(48, 64, 0)}`,
  },
  gingham: {
    size: 44,
    bg: '#f4efe5',
    svg: `<rect x="0" y="0" width="22" height="44" fill="${S}" opacity=".28"/><rect x="0" y="0" width="44" height="22" fill="${S}" opacity=".28"/>`,
  },
  terrazzo: {
    size: 180,
    bg: '#efe6db',
    svg: `<path d="M20 30 l14 -6 6 10 -12 8z" fill="${T}"/><path d="M120 20 l10 4 -2 10 -11 -3z" fill="${S}"/><path d="M80 90 l16 2 -4 12 -14 -4z" fill="${M}"/>
      <path d="M150 120 l12 6 -8 10 -9 -8z" fill="${P}"/><path d="M40 140 l9 -2 4 9 -10 3z" fill="${S}"/><path d="M100 160 l6 -8 8 6 -6 7z" fill="${T}" opacity=".8"/>
      <circle cx="60" cy="60" r="3" fill="${M}"/><circle cx="160" cy="60" r="2.5" fill="${T}"/><circle cx="130" cy="80" r="2" fill="#8c7b6b"/><circle cx="20" cy="100" r="2.5" fill="${P}"/>
      <circle cx="90" cy="130" r="1.8" fill="#8c7b6b"/><circle cx="170" cy="170" r="3" fill="${S}"/>`,
  },
};

export const WALLS: { id: Wall; name: string }[] = [
  { id: 'boho', name: 'Boho' },
  { id: 'floral', name: 'Papatya' },
  { id: 'stripes', name: 'Vintage' },
  { id: 'gingham', name: 'Pötikare' },
  { id: 'terrazzo', name: 'Terrazzo' },
  { id: 'plain', name: 'Sade' },
];

/** CSS background for a wallpaper, or null for the plain (palette blobs) look. */
export const wallStyle = (wall: Wall): { backgroundColor: string; backgroundImage: string; backgroundSize: string } | null => {
  if (wall === 'plain') return null;
  const t = TILES[wall];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.size}" height="${t.size}" viewBox="0 0 ${t.size} ${t.size}">${t.svg}</svg>`;
  return {
    backgroundColor: t.bg,
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' '))}")`,
    backgroundSize: `${t.size}px ${t.size}px`,
  };
};
