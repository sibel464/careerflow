import React, { useRef, useState } from 'react';
import { Plus, Trash2, LayoutGrid, Pin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useCorner } from '../../Hooks/useCorner';
import { BoardNote, NoteColor, NOTE_COLORS, PIN_COLORS } from '../../Utils/corner';
import { cn } from '../../Utils/classNames';
import { DecorPicker } from '../../Components/DecorPicker';

const NOTE_W = 200;
const NOTE_H = 190;

export const Corkboard: React.FC = () => {
  const { notes, setNotes } = useCorner();
  const board = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const topZ = notes.reduce((m, n) => Math.max(m, n.z), 0);
  const patch = (id: string, p: Partial<BoardNote>) => setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...p } : n)));

  const toPercent = (clientX: number, clientY: number, dx: number, dy: number) => {
    const r = board.current!.getBoundingClientRect();
    const maxX = 100 - (NOTE_W / r.width) * 100;
    const maxY = 100 - (NOTE_H / r.height) * 100;
    return {
      x: Math.min(Math.max(((clientX - r.left - dx) / r.width) * 100, 0), maxX),
      y: Math.min(Math.max(((clientY - r.top - dy) / r.height) * 100, 0), maxY),
    };
  };

  const onPointerDown = (e: React.PointerEvent, n: BoardNote) => {
    if (editing === n.id || (e.target as HTMLElement).closest('button')) return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.setPointerCapture(e.pointerId);
    setDrag({ id: n.id, dx: e.clientX - rect.left, dy: e.clientY - rect.top, x: n.x, y: n.y });
    if (n.z < topZ) patch(n.id, { z: topZ + 1 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag({ ...drag, ...toPercent(e.clientX, e.clientY, drag.dx, drag.dy) });
  };
  const onPointerUp = () => {
    if (!drag) return;
    patch(drag.id, { x: drag.x, y: drag.y });
    setDrag(null);
  };

  const add = (color: NoteColor) => {
    const id = uuidv4();
    setNotes(prev => [...prev, {
      id, text: '', color, x: 8 + Math.random() * 60, y: 8 + Math.random() * 50,
      rotation: Math.round((Math.random() * 8 - 4) * 10) / 10, pin: Math.random() > 0.5 ? 'pin' : 'tape', z: topZ + 1,
    }]);
    setEditing(id);
  };

  const tidy = () => {
    const r = board.current!.getBoundingClientRect();
    const cols = Math.max(1, Math.floor(r.width / (NOTE_W + 24)));
    const cw = 100 / cols;
    const rh = ((NOTE_H + 30) / r.height) * 100;
    setNotes(prev => [...prev].sort((a, b) => a.z - b.z).map((n, i) => ({
      ...n, x: (i % cols) * cw + (cw - (NOTE_W / r.width) * 100) / 2, y: 4 + Math.floor(i / cols) * rh, rotation: (i % 3) - 1,
    })));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Not Panosu 📌</h1>
          <p className="text-ink-soft mt-2">Notları sürükle, çift tıklayıp yaz. Her şey otomatik kaydedilir.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DecorPicker rows={['board', 'wood']} />
          <button onClick={tidy} className="btn-ghost px-3 py-2.5 text-sm font-bold flex items-center gap-1.5"><LayoutGrid className="w-4 h-4" /> Toparla</button>
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-glass/50 border border-glass/60">
            <Plus className="w-4 h-4 text-ink-muted ml-1" />
            {(Object.keys(NOTE_COLORS) as NoteColor[]).map(c => (
              <button key={c} onClick={() => add(c)} aria-label={`${c} not ekle`} className="w-8 h-8 rounded-lg shadow-sm hover:-translate-y-0.5 hover:rotate-3 transition-transform" style={{ background: NOTE_COLORS[c].bg, borderBottom: `3px solid ${NOTE_COLORS[c].edge}` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-[28px]">
        <div ref={board} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onDoubleClick={(e) => { if (e.target === board.current) add('yellow'); }}
          className="board-surface relative min-w-[760px] h-[680px] rounded-[28px] border-[14px] border-[var(--wood-frame)] shadow-[inset_0_0_30px_rgba(0,0,0,0.35),0_24px_40px_-20px_rgba(70,40,20,0.55)] overflow-hidden touch-none select-none">
          {notes.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center font-hand text-3xl board-hint pointer-events-none">Boş bir yere çift tıkla ve ilk notunu as ✏️</p>
          )}
          {notes.map((n, i) => {
            const pos = drag?.id === n.id ? drag : n;
            const dragging = drag?.id === n.id;
            const pinColor = PIN_COLORS[i % PIN_COLORS.length];
            return (
              <div key={n.id} onPointerDown={(e) => onPointerDown(e, n)} onDoubleClick={(e) => { e.stopPropagation(); setEditing(n.id); }}
                className={cn('group absolute p-5 pt-7 flex flex-col', dragging ? 'cursor-grabbing' : 'cursor-grab transition-[transform,box-shadow] duration-200')}
                style={{
                  left: `${pos.x}%`, top: `${pos.y}%`, width: NOTE_W, minHeight: NOTE_H - 20, zIndex: dragging ? 999 : n.z,
                  background: `linear-gradient(170deg, ${NOTE_COLORS[n.color].bg} 70%, ${NOTE_COLORS[n.color].edge})`,
                  transform: `rotate(${dragging ? 0 : n.rotation}deg) scale(${dragging ? 1.06 : 1})`,
                  boxShadow: dragging ? '0 25px 35px -10px rgba(0,0,0,0.45)' : '0 10px 18px -8px rgba(0,0,0,0.4), 0 2px 3px rgba(0,0,0,0.12)',
                }}>
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[linear-gradient(135deg,rgba(0,0,0,0.12)_50%,transparent_50%)]" style={{ backgroundColor: NOTE_COLORS[n.color].edge }} />
                {n.pin === 'pin' ? (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_3px_3px_rgba(0,0,0,0.35)]"
                    style={{ background: `radial-gradient(circle at 35% 30%, white -20%, ${pinColor} 45%, color-mix(in srgb, ${pinColor} 60%, black))` }} />
                ) : (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/45 backdrop-blur-[1px] rotate-[-3deg] shadow-sm border-x border-dashed border-white/50" />
                )}
                {editing === n.id ? (
                  <textarea autoFocus defaultValue={n.text} onBlur={(e) => { patch(n.id, { text: e.target.value }); setEditing(null); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur(); }}
                    placeholder="Bir şeyler yaz…" className="flex-1 min-h-[130px] w-full bg-transparent resize-none outline-none font-hand text-[22px] leading-6 text-[#3b2f2a] placeholder:text-[#3b2f2a]/40" />
                ) : (
                  <p className="font-hand text-[22px] leading-6 text-[#3b2f2a] whitespace-pre-wrap break-words">{n.text || <span className="opacity-40">Çift tıkla, yaz…</span>}</p>
                )}
                <div className="absolute bottom-1.5 left-2 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {(Object.keys(NOTE_COLORS) as NoteColor[]).filter(c => c !== n.color).map(c => (
                      <button key={c} onClick={() => patch(n.id, { color: c })} aria-label={`Rengi ${c} yap`} className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: NOTE_COLORS[c].bg }} />
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => patch(n.id, { pin: n.pin === 'pin' ? 'tape' : 'pin' })} aria-label="Raptiye/bant" className="p-1 rounded text-[#3b2f2a]/60 hover:text-[#3b2f2a]"><Pin className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))} aria-label="Notu sil" className="p-1 rounded text-[#3b2f2a]/60 hover:text-[#b5544a]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
