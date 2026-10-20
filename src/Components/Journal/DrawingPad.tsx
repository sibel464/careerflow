import React, { useEffect, useRef, useState } from 'react';
import { X, Undo2, Trash2, Check, Pen, Highlighter, Eraser } from 'lucide-react';
import { cn } from '../../Utils/classNames';

type Tool = 'pen' | 'marker' | 'eraser';

const COLORS = ['#2b1d14', '#c05c3e', '#e8b923', '#3a9a6e', '#4f86c0', '#7a4a8a', '#f48fb1', '#ffffff'];
const SIZES = [3, 7, 14];
const W = 1200;
const H = 800;

/** A simple sketchbook: pen, marker, eraser, undo. Saves a PNG. */
export const DrawingPad: React.FC<{ onSave: (dataUrl: string) => void; onClose: () => void }> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [history, setHistory] = useState<ImageData[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const ctx = () => canvasRef.current!.getContext('2d')!;

  useEffect(() => {
    const c = ctx();
    c.fillStyle = '#fffdf7';
    c.fillRect(0, 0, W, H);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const point = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  const start = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setHistory(h => [...h.slice(-24), ctx().getImageData(0, 0, W, H)]);
    drawing.current = true;
    last.current = point(e);
    move(e);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const c = ctx();
    const p = point(e);
    const pressure = e.pointerType === 'pen' && e.pressure > 0 ? 0.4 + e.pressure : 1;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.globalAlpha = tool === 'marker' ? 0.35 : 1;
    c.strokeStyle = tool === 'eraser' ? '#fffdf7' : color;
    c.lineWidth = (tool === 'marker' ? size * 2.5 : tool === 'eraser' ? size * 3 : size) * pressure;
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    c.lineTo(p.x, p.y);
    c.stroke();
    c.globalAlpha = 1;
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    ctx().putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  };

  const clear = () => {
    setHistory(h => [...h.slice(-24), ctx().getImageData(0, 0, W, H)]);
    const c = ctx();
    c.fillStyle = '#fffdf7';
    c.fillRect(0, 0, W, H);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-md" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Çizim" className="relative z-10 w-full max-w-5xl rounded-3xl bg-cream border border-glass/70 shadow-2xl overflow-hidden animate-pop">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-glass/60">
          <h2 className="font-serif font-bold text-ink text-lg mr-2">Çizim ✏️</h2>
          <div className="flex gap-1 p-1 rounded-xl bg-glass/50">
            {([['pen', Pen, 'Kalem'], ['marker', Highlighter, 'Fosforlu'], ['eraser', Eraser, 'Silgi']] as const).map(([t, Icon, label]) => (
              <button key={t} onClick={() => setTool(t)} aria-label={label} title={label} aria-pressed={tool === t}
                className={cn('w-9 h-9 rounded-lg flex items-center justify-center', tool === t ? 'bg-moss text-white' : 'text-ink-soft hover:bg-glass/70')}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {COLORS.map(c => (
              <button key={c} onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }} aria-label={`Renk ${c}`} aria-pressed={color === c}
                className={cn('w-7 h-7 rounded-full border-2 transition-transform', color === c && tool !== 'eraser' ? 'border-ink scale-115 ring-2 ring-moss/40' : 'border-black/10')}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-1 items-center">
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)} aria-label={`Kalınlık ${s}`} aria-pressed={size === s}
                className={cn('w-9 h-9 rounded-lg flex items-center justify-center', size === s ? 'bg-glass/90 shadow-sm' : 'hover:bg-glass/60')}>
                <span className="rounded-full bg-ink" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            <button onClick={undo} disabled={!history.length} className="btn-ghost w-9 h-9 disabled:opacity-40" aria-label="Geri al"><Undo2 className="w-4 h-4" /></button>
            <button onClick={clear} className="btn-ghost w-9 h-9" aria-label="Temizle"><Trash2 className="w-4 h-4" /></button>
            <button onClick={onClose} className="btn-ghost w-9 h-9" aria-label="Kapat"><X className="w-4 h-4" /></button>
            <button onClick={() => onSave(canvasRef.current!.toDataURL('image/png'))} className="btn-primary px-4 h-9 text-sm"><Check className="w-4 h-4 mr-1.5" /> Sayfaya ekle</button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="w-full h-auto block touch-none cursor-crosshair bg-[#fffdf7]"
        />
      </div>
    </div>
  );
};
