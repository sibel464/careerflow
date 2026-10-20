import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../Utils/classNames';

export type PageSide = 'left' | 'right' | 'single';

interface BookProps {
  /** Index of the left page (spread) or the visible page (single). */
  index: number;
  onIndexChange: (index: number) => void;
  minIndex: number;
  maxIndex: number;
  renderPage: (index: number, side: PageSide, interactive: boolean) => React.ReactNode;
  /** Leather color of the cover around the pages. */
  cover?: string;
  /** Page number label shown in the corner, if any. */
  pageLabel?: (index: number) => string | null;
  className?: string;
}

interface FlipState { dir: 1 | -1; progress: number; dragging: boolean }

const FLIP_MS = 700;
const SOUND_KEY = 'careerflow_book_sound';

/** A quiet, synthesized paper rustle. */
function playPageSound() {
  try {
    const ctx = new AudioContext();
    const length = Math.floor(ctx.sampleRate * 0.32);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 1.6) * (0.6 + 0.4 * Math.random());
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2600;
    band.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start();
    window.setTimeout(() => ctx.close(), 600);
  } catch { /* sound is optional */ }
}

const useIsWide = () => {
  const query = '(min-width: 1180px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
};

const isTyping = (el: Element | null) =>
  !!el && ((el as HTMLElement).isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** One sheet surface: paper, gutter shading and a page number. */
const Paper: React.FC<{ side: PageSide; label?: string | null; children: React.ReactNode; shade?: number }> = ({ side, label, children, shade = 0 }) => (
  <div className={cn('book-paper absolute inset-0 overflow-hidden', side === 'left' ? 'rounded-l-md' : side === 'right' ? 'rounded-r-md' : 'rounded-md')}>
    <div className="absolute inset-0">{children}</div>
    {/* Shadow of the spine falling onto the paper */}
    {side !== 'single' && (
      <div className={cn('absolute inset-y-0 w-16 pointer-events-none', side === 'left' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r', 'from-black/18 via-black/5 to-transparent')} />
    )}
    {shade > 0 && <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: shade }} />}
    {label && (
      <span className={cn('absolute bottom-3 text-[11px] font-serif italic text-[#a39684] pointer-events-none', side === 'left' ? 'left-6' : 'right-6')}>{label}</span>
    )}
  </div>
);

/**
 * A book you can leaf through: two-page spread on wide screens, a single page on small ones.
 * Pages turn in 3D around the spine — click the arrows, use ← →, or drag a page edge.
 */
export const Book: React.FC<BookProps> = ({ index: rawIndex, onIndexChange, minIndex, maxIndex, renderPage, cover = '#6b4c3a', pageLabel, className }) => {
  const wide = useIsWide();
  const step = wide ? 2 : 1;
  // In a spread the left page is always an even page from the start.
  const index = wide ? rawIndex - (((rawIndex - minIndex) % 2) + 2) % 2 : rawIndex;
  const [flip, setFlip] = useState<FlipState | null>(null);

  // Let the owner know which page is really on the left, so its own state (calendar, etc.) matches.
  useEffect(() => {
    if (index !== rawIndex) onIndexChange(index);
  }, [index, rawIndex, onIndexChange]);
  const [sound, setSound] = useState(() => localStorage.getItem(SOUND_KEY) !== 'off');
  const bookRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  const canGo = useCallback((dir: 1 | -1) => {
    const target = index + dir * step;
    return dir === 1 ? target <= maxIndex : target + (wide ? 1 : 0) >= minIndex && index > minIndex;
  }, [index, step, maxIndex, minIndex, wide]);

  const commit = useCallback((dir: 1 | -1) => {
    onIndexChange(index + dir * step);
    setFlip(null);
  }, [index, step, onIndexChange]);

  const turn = useCallback((dir: 1 | -1) => {
    if (flip || !canGo(dir)) return;
    if (sound) playPageSound();
    setFlip({ dir, progress: 0, dragging: false });
    // Next frame: animate to the end.
    requestAnimationFrame(() => requestAnimationFrame(() => setFlip(f => (f ? { ...f, progress: 1 } : f))));
    window.setTimeout(() => commit(dir), FLIP_MS);
  }, [flip, canGo, sound, commit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(document.activeElement) || document.querySelector('[role="dialog"]')) return;
      if (e.key === 'ArrowRight') turn(1);
      if (e.key === 'ArrowLeft') turn(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  // Drag a page edge to turn it by hand.
  const onEdgeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const dir = Number(e.currentTarget.dataset.dir) as 1 | -1;
    if (flip || !canGo(dir)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const width = bookRef.current!.getBoundingClientRect().width / (wide ? 2 : 1);
    dragStart.current = { x: e.clientX, width };
    setFlip({ dir, progress: 0, dragging: true });
  };
  const onEdgeMove = (e: React.PointerEvent) => {
    if (!flip?.dragging || !dragStart.current) return;
    const moved = (dragStart.current.x - e.clientX) * flip.dir;
    setFlip({ ...flip, progress: Math.max(0, Math.min(1, moved / (dragStart.current.width * 1.6))) });
  };
  const onEdgeUp = () => {
    if (!flip?.dragging) return;
    const done = flip.progress > 0.3;
    if (done && sound) playPageSound();
    setFlip({ ...flip, dragging: false, progress: done ? 1 : 0 });
    window.setTimeout(() => (done ? commit(flip.dir) : setFlip(null)), FLIP_MS * 0.6);
  };

  const page = (i: number, side: PageSide, interactive: boolean) =>
    i < minIndex || i > maxIndex
      ? <div className="w-full h-full book-blank" />
      : renderPage(i, side, interactive);

  const label = (i: number) => (i < minIndex || i > maxIndex ? null : pageLabel?.(i) ?? null);
  const p = flip?.progress ?? 0;
  const transition = flip && !flip.dragging ? `transform ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.2, 1), box-shadow ${FLIP_MS}ms` : 'none';
  // Shading peaks halfway through the turn.
  const shade = Math.sin(p * Math.PI) * 0.22;

  let leftStatic = index;
  let rightStatic = index + 1;
  if (flip && wide) {
    if (flip.dir === 1) rightStatic = index + 3;
    else leftStatic = index - 2;
  }

  return (
    <div className={cn('select-none', className)}>
      <div
        className="relative mx-auto rounded-2xl p-3 sm:p-4 shadow-[0_30px_70px_rgba(40,25,15,0.35)]"
        style={{
          background: `linear-gradient(135deg, ${cover}, color-mix(in srgb, ${cover} 70%, black))`,
          // Always fit the whole book on screen: width follows the available height.
          maxWidth: wide ? 'min(1180px, calc((100vh - 250px) * 1.48 + 32px))' : 'min(620px, calc((100vh - 210px) * 0.74 + 24px))',
        }}
      >
        {/* Leather grain and stitching */}
        <div className="absolute inset-0 rounded-2xl opacity-25 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1.5px)] bg-[length:6px_6px]" />
        <div className="absolute inset-[6px] rounded-xl border border-dashed border-white/25 pointer-events-none" />
        {/* Ribbon bookmark */}
        <div className="absolute -bottom-6 right-[18%] w-5 h-14 bg-[#c0392b] shadow-md pointer-events-none [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]" />

        <div
          ref={bookRef}
          className={cn('relative book-stack', wide ? 'aspect-[1.48/1]' : 'aspect-[0.74/1]')}
          style={{ perspective: '2600px' }}
          onPointerMove={onEdgeMove}
          onPointerUp={onEdgeUp}
          onPointerCancel={onEdgeUp}
        >
          {wide ? (
            <>
              <div className="absolute inset-y-0 left-0 w-1/2"><Paper side="left" label={label(leftStatic)}>{page(leftStatic, 'left', !flip)}</Paper></div>
              <div className="absolute inset-y-0 right-0 w-1/2"><Paper side="right" label={label(rightStatic)} shade={flip?.dir === 1 ? shade * 0.6 : 0}>{page(rightStatic, 'right', !flip)}</Paper></div>
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-transparent via-black/25 to-transparent pointer-events-none z-10" />
            </>
          ) : (
            <Paper side="single" label={label(flip?.dir === 1 ? index + 1 : index)}>{page(flip?.dir === 1 ? index + 1 : index, 'single', !flip)}</Paper>
          )}

          {/* The turning leaf */}
          {flip && (
            <div
              className={cn('absolute inset-y-0 z-20 [transform-style:preserve-3d]', wide ? 'w-1/2' : 'w-full', flip.dir === 1 || !wide ? 'right-0 origin-left' : 'left-0 origin-right')}
              style={{
                transform: wide
                  ? `rotateY(${flip.dir === 1 ? -180 * p : 180 * p}deg)`
                  : flip.dir === 1 ? `rotateY(${-180 * p}deg)` : `rotateY(${-180 * (1 - p)}deg)`,
                transition,
              }}
            >
              <div className="absolute inset-0 [backface-visibility:hidden] shadow-[0_0_30px_rgba(0,0,0,0.25)]">
                <Paper side={wide ? (flip.dir === 1 ? 'right' : 'left') : 'single'} shade={shade}
                  label={label(wide ? (flip.dir === 1 ? index + 1 : index) : flip.dir === 1 ? index : index - 1)}>
                  {page(wide ? (flip.dir === 1 ? index + 1 : index) : flip.dir === 1 ? index : index - 1, wide ? (flip.dir === 1 ? 'right' : 'left') : 'single', false)}
                </Paper>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Paper side={wide ? (flip.dir === 1 ? 'left' : 'right') : 'single'} shade={0.22 - shade}
                  label={wide ? label(flip.dir === 1 ? index + 2 : index - 1) : null}>
                  {wide ? page(flip.dir === 1 ? index + 2 : index - 1, flip.dir === 1 ? 'left' : 'right', false) : <div className="w-full h-full book-blank" />}
                </Paper>
              </div>
            </div>
          )}

          {/* Grab zones on the outer edges */}
          {!flip && canGo(1) && (
            <div data-dir={1} onPointerDown={onEdgeDown} className="absolute right-0 inset-y-0 w-7 z-30 cursor-grab group touch-none" title="Sürükleyerek çevir">
              <span className="absolute right-0 bottom-0 w-10 h-10 bg-gradient-to-tl from-[#e9dfcc] via-[#f7f1e4] to-transparent rounded-tl-[100%] shadow-[-3px_-3px_6px_rgba(0,0,0,0.08)] opacity-70 group-hover:opacity-100 group-hover:w-14 group-hover:h-14 transition-all" />
            </div>
          )}
          {!flip && canGo(-1) && (
            <div data-dir={-1} onPointerDown={onEdgeDown} className="absolute left-0 inset-y-0 w-7 z-30 cursor-grab group touch-none" title="Sürükleyerek çevir">
              <span className="absolute left-0 bottom-0 w-10 h-10 bg-gradient-to-tr from-[#e9dfcc] via-[#f7f1e4] to-transparent rounded-tr-[100%] shadow-[3px_-3px_6px_rgba(0,0,0,0.08)] opacity-70 group-hover:opacity-100 group-hover:w-14 group-hover:h-14 transition-all" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8">
        <button onClick={() => turn(-1)} disabled={!canGo(-1) || !!flip} className="btn-ghost w-11 h-11 disabled:opacity-35" aria-label="Önceki sayfa"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-xs font-bold text-ink-muted min-w-32 text-center">← → tuşları ya da sayfa kenarını sürükle</span>
        <button onClick={() => turn(1)} disabled={!canGo(1) || !!flip} className="btn-ghost w-11 h-11 disabled:opacity-35" aria-label="Sonraki sayfa"><ChevronRight className="w-5 h-5" /></button>
        <button
          onClick={() => { const next = !sound; setSound(next); localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); }}
          className="p-2 rounded-lg text-ink-muted hover:text-ink" aria-label={sound ? 'Sayfa sesini kapat' : 'Sayfa sesini aç'} title="Sayfa sesi"
        >
          {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
