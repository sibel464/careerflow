/** A smooth winding trail through fixed anchor points (Catmull-Rom → cubic Bézier), sampled by length. */
export interface Pt { x: number; y: number }

export const MAP_W = 1000;
export const MAP_H = 560;

export const TRAIL: Pt[] = [
  { x: 90, y: 488 }, { x: 250, y: 430 }, { x: 205, y: 318 }, { x: 360, y: 258 },
  { x: 540, y: 330 }, { x: 640, y: 222 }, { x: 560, y: 128 }, { x: 760, y: 104 }, { x: 900, y: 168 },
];

const segments = (pts: Pt[]) => pts.slice(0, -1).map((p1, i) => {
  const p0 = pts[i - 1] ?? p1;
  const p2 = pts[i + 1];
  const p3 = pts[i + 2] ?? p2;
  return {
    p1, p2,
    c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
    c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
  };
});

export const trailD = (pts: Pt[] = TRAIL) => {
  const segs = segments(pts);
  return `M${pts[0].x} ${pts[0].y} ` + segs.map(s => `C${s.c1.x} ${s.c1.y} ${s.c2.x} ${s.c2.y} ${s.p2.x} ${s.p2.y}`).join(' ');
};

const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/** Dense samples with cumulative length, computed once. */
const SAMPLES = (() => {
  const out: { x: number; y: number; len: number }[] = [];
  let len = 0;
  segments(TRAIL).forEach(s => {
    for (let i = out.length ? 1 : 0; i <= 60; i++) {
      const t = i / 60;
      const p = { x: bez(s.p1.x, s.c1.x, s.c2.x, s.p2.x, t), y: bez(s.p1.y, s.c1.y, s.c2.y, s.p2.y, t) };
      const prev = out[out.length - 1];
      if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
      out.push({ ...p, len });
    }
  });
  return out;
})();

const TOTAL = SAMPLES[SAMPLES.length - 1].len;

/** Point at a fraction (0..1) of the trail's length. */
export const pointAt = (f: number): Pt => {
  const target = Math.min(Math.max(f, 0), 1) * TOTAL;
  let lo = 0;
  let hi = SAMPLES.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (SAMPLES[mid].len < target) lo = mid + 1; else hi = mid;
  }
  const b = SAMPLES[lo];
  const a = SAMPLES[Math.max(lo - 1, 0)];
  const span = b.len - a.len || 1;
  const k = (target - a.len) / span;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};
