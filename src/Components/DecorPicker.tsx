import React, { useEffect, useRef, useState } from 'react';
import { Paintbrush } from 'lucide-react';
import { usePreferences } from '../Hooks/PreferencesContext';
import { BOARDS, Decor, PAPERS, WOODS } from '../Utils/decor';
import { cn } from '../Utils/classNames';
import { WALLS, Wall, wallStyle } from '../Utils/wallpapers';

const wallSwatch = (w: Wall) => { const st = wallStyle(w); return st && { ...st, backgroundSize: '70px 70px' }; };

type Row = keyof Decor;

const ROWS: Record<Row, { title: string; options: { id: string; name: string; a: string; b: string }[] }> = {
  wall: { title: 'Duvar kâğıdı', options: WALLS.map(w => ({ ...w, a: '', b: '' })) },
  wood: { title: 'Ahşap', options: WOODS },
  board: { title: 'Pano yüzeyi', options: BOARDS },
  paper: { title: 'Kâğıt', options: PAPERS },
};

/** Swatch rows for wood / board / paper. Used inline in Settings and inside the popover. */
export const DecorRows: React.FC<{ rows?: Row[] }> = ({ rows = ['wall', 'wood', 'board', 'paper'] }) => {
  const { preferences, updatePreferences } = usePreferences();
  return (
    <div className="space-y-4">
      {rows.map(row => (
        <div key={row}>
          <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted mb-2">{ROWS[row].title}</p>
          <div className="flex flex-wrap gap-2">
            {ROWS[row].options.map(o => {
              const active = preferences.decor[row] === o.id;
              return (
                <button key={o.id} onClick={() => updatePreferences({ decor: { ...preferences.decor, [row]: o.id } })} aria-pressed={active}
                  className={cn('flex flex-col items-center gap-1 p-1 rounded-xl transition-all', active ? 'bg-moss/10 ring-2 ring-moss' : 'hover:bg-glass/60')}>
                  <span className="w-12 h-9 rounded-lg shadow-inner border border-black/10"
                    style={row === 'wall' ? (wallSwatch(o.id as Wall) ?? { background: 'linear-gradient(135deg, var(--blob-1, #d9d4f0), var(--blob-2, #f3d9e6))' }) : { background: row === 'paper'
                      ? `repeating-linear-gradient(to bottom, ${o.a} 0 7px, color-mix(in srgb, ${o.b} 35%, ${o.a}) 7px 8px)`
                      : `linear-gradient(160deg, ${o.a}, ${o.b})` }} />
                  <span className={cn('text-[10px] font-bold', active ? 'text-moss' : 'text-ink-soft')}>{o.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/** A "Dekor" button that opens the swatches in a popover. */
export const DecorPicker: React.FC<{ rows?: Row[]; className?: string }> = ({ rows, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="btn-ghost px-3.5 py-2.5 text-sm font-bold flex items-center gap-1.5">
        <Paintbrush className="w-4 h-4" /> Dekor
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[min(330px,90vw)] p-4 rounded-2xl bg-cream border border-glass/70 shadow-2xl animate-pop">
          <DecorRows rows={rows} />
        </div>
      )}
    </div>
  );
};
