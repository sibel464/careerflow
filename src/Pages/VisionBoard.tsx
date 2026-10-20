import React, { useRef, useState } from 'react';
import { Plus, Trash2, Check, Shuffle, ImagePlus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { usePreferences } from '../Hooks/PreferencesContext';
import { useMedia } from '../Hooks/useMedia';
import { saveMedia, deleteMedia, compressImage } from '../Utils/mediaStore';
import { fireConfetti } from '../Utils/confetti';
import { DecorPicker } from '../Components/DecorPicker';
import { cn } from '../Utils/classNames';

export const VISION_KEY = 'careerflow_vision';

export interface VisionNote {
  id: string;
  text: string;
  emoji: string;
  color: string;
  kind: 'dream' | 'goal' | 'photo';
  done: boolean;
  x: number; // % of board width
  y: number; // % of board height
  rotation: number;
  /** Media id of a polaroid photo (IndexedDB). */
  photo?: string;
}

const COLORS = ['#fde9b8', '#f9d5c5', '#d4ecd9', '#d6e4f5', '#ead7f0', '#fff3c4'];
const EMOJIS = ['✨', '🌍', '🏡', '💻', '📚', '🎨', '✈️', '💪', '🌱', '💰', '🎓', '❤️'];
const PIN_COLORS = ['#d94848', '#3f7fd6', '#e0a923', '#3a9a6e', '#9b59b6'];

const seed = (): VisionNote[] => [
  { id: uuidv4(), text: 'Mezuniyet günü 🎓', emoji: '🎓', color: '#c2577a', kind: 'photo', done: false, x: 5, y: 6, rotation: -5 },
  { id: uuidv4(), text: 'Yılda bir kez yeni bir ülke keşfetmek', emoji: '✈️', color: COLORS[3], kind: 'dream', done: false, x: 30, y: 12, rotation: 2 },
  { id: uuidv4(), text: 'Kapadokya balon turu', emoji: '🎈', color: '#4f86c0', kind: 'photo', done: false, x: 56, y: 5, rotation: 4 },
  { id: uuidv4(), text: 'Bir teknoloji şirketinde staj yapmak', emoji: '🎯', color: COLORS[0], kind: 'goal', done: false, x: 78, y: 18, rotation: -3 },
  { id: uuidv4(), text: 'Portfolyo sitemi yayına almak', emoji: '🎨', color: COLORS[1], kind: 'goal', done: true, x: 14, y: 56, rotation: 3 },
  { id: uuidv4(), text: 'Açık kaynak bir projeye katkı vermek', emoji: '💻', color: COLORS[4], kind: 'goal', done: false, x: 44, y: 54, rotation: -2 },
  { id: uuidv4(), text: 'Kendi küçük evim', emoji: '🏡', color: '#3a9a6e', kind: 'photo', done: false, x: 70, y: 52, rotation: 6 },
];

/** The picture area of a polaroid: the uploaded photo, or a little emoji "scene". */
const PolaroidPhoto: React.FC<{ note: VisionNote }> = ({ note }) => {
  const src = useMedia(note.photo ?? '__none__');
  if (note.photo && src) return <img src={src} alt={note.text} draggable={false} className="w-full aspect-square object-cover" />;
  return (
    <div className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${note.color} 45%, white), ${note.color})` }}>
      <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/30" />
      <span className="absolute bottom-0 inset-x-0 h-1/3 bg-black/10 [clip-path:polygon(0_40%,30%_10%,60%_45%,100%_0,100%_100%,0_100%)]" />
      <span className="relative text-6xl drop-shadow-lg">{note.emoji}</span>
    </div>
  );
};

export const VisionBoard: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<VisionNote[]>(VISION_KEY, seed);
  const { preferences } = usePreferences();
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [kind, setKind] = useState<VisionNote['kind']>('photo');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  // Live position while dragging; saved once on release.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const update = (id: string, changes: Partial<VisionNote>) =>
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...changes } : n)));

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await compressImage(file, 900, 0.8));
    } catch {
      toast.error('Bu fotoğraf okunamadı. 📷');
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const id = uuidv4();
    let photoId: string | undefined;
    if (kind === 'photo' && photo) {
      photoId = `vision-${id}`;
      await saveMedia(photoId, photo);
    }
    setNotes(prev => [...prev, {
      id, text: text.trim(), emoji, color: kind === 'photo' ? PIN_COLORS[prev.length % PIN_COLORS.length] : color, kind, done: false, photo: photoId,
      x: 10 + Math.random() * 60, y: 10 + Math.random() * 50, rotation: Math.round(Math.random() * 10 - 5),
    }]);
    setText('');
    setPhoto(null);
  };

  const removeNote = (note: VisionNote) => {
    if (note.photo) deleteMedia(note.photo).catch(() => undefined);
    setNotes(prev => prev.filter(n => n.id !== note.id));
  };

  const toggleDone = (note: VisionNote) => {
    update(note.id, { done: !note.done });
    if (!note.done && preferences.celebrate) fireConfetti(90);
  };

  const shuffle = () =>
    setNotes(prev => prev.map(n => ({ ...n, x: 4 + Math.random() * 68, y: 4 + Math.random() * 56, rotation: Math.round(Math.random() * 10 - 5) })));

  // Pointer-based dragging works for mouse, pen and touch alike.
  const onPointerDown = (e: React.PointerEvent, note: VisionNote) => {
    if ((e.target as HTMLElement).closest('button, textarea')) return;
    const card = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - card.left, y: e.clientY - card.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(note.id);
    // Bring to front.
    setNotes(prev => [...prev.filter(n => n.id !== note.id), note]);
  };

  const onPointerMove = (e: React.PointerEvent, note: VisionNote) => {
    if (dragging !== note.id || !boardRef.current) return;
    const board = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - board.left - dragOffset.current.x) / board.width) * 100;
    const y = ((e.clientY - board.top - dragOffset.current.y) / board.height) * 100;
    setDragPos({ x: Math.max(0, Math.min(x, 82)), y: Math.max(0, Math.min(y, 70)) });
  };

  const onPointerUp = (note: VisionNote) => {
    if (dragging === note.id && dragPos) update(note.id, dragPos);
    setDragging(null);
    setDragPos(null);
  };

  const goals = notes.filter(n => n.kind === 'goal');
  const doneGoals = goals.filter(n => n.done).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Hayal Panosu 🌠</h1>
          <p className="text-ink-soft mt-2">Fotoğraflarını, hayallerini ve hedeflerini as. Sürükle, düzenlemek için çift tıkla.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {goals.length > 0 && (
            <span className="glass-panel px-4 py-2.5 rounded-2xl text-sm font-bold text-ink">🎯 {doneGoals}/{goals.length} hedef</span>
          )}
          <DecorPicker rows={['board', 'wood']} />
          <button onClick={shuffle} className="btn-ghost px-4 py-2.5 text-sm"><Shuffle className="w-4 h-4 mr-2" /> Karıştır</button>
        </div>
      </div>

      <form onSubmit={add} className="glass-panel p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex p-1 bg-glass/40 border border-glass/60 rounded-xl shrink-0">
          {([['photo', '📷 Polaroid'], ['dream', '✨ Hayal'], ['goal', '🎯 Hedef']] as const).map(([k, label]) => (
            <button type="button" key={k} onClick={() => setKind(k)} className={cn('px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap', kind === k ? 'bg-glass/80 text-moss shadow-sm' : 'text-ink-soft')}>{label}</button>
          ))}
        </div>
        {kind === 'photo' && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
            {photo ? (
              <span className="relative shrink-0">
                <img src={photo} alt="Seçilen fotoğraf" className="w-12 h-12 rounded-lg object-cover shadow" />
                <button type="button" onClick={() => setPhoto(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-cream flex items-center justify-center" aria-label="Fotoğrafı kaldır"><X className="w-3 h-3" /></button>
              </span>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost px-3 py-2.5 text-sm shrink-0"><ImagePlus className="w-4 h-4 mr-1.5" /> Fotoğraf</button>
            )}
          </>
        )}
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={90}
          placeholder={kind === 'photo' ? 'Altına ne yazalım? (örn: Mezuniyet günü)' : kind === 'dream' ? 'Bir hayalini yaz… (örn: Deniz kenarında bir ev)' : 'Ölçülebilir bir hedef yaz… (örn: Ay sonuna kadar 3 kitap)'}
          className="flex-1 px-4 py-3 glass-input rounded-xl text-ink font-medium placeholder:text-ink-muted" />
        <div className="flex items-center gap-1 overflow-x-auto">
          {EMOJIS.slice(0, 8).map(em => (
            <button type="button" key={em} onClick={() => setEmoji(em)} className={cn('w-9 h-9 rounded-lg text-lg shrink-0', emoji === em ? 'bg-moss/15 ring-2 ring-moss/40' : 'hover:bg-glass/60')}>{em}</button>
          ))}
        </div>
        {kind !== 'photo' && (
          <div className="flex items-center gap-1.5">
            {COLORS.map(c => (
              <button type="button" key={c} onClick={() => setColor(c)} aria-label="Renk seç" className={cn('w-7 h-7 rounded-full border-2 shrink-0', color === c ? 'border-ink scale-110' : 'border-white/70')} style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
        <button type="submit" disabled={!text.trim()} className="btn-primary px-5 py-3 text-sm disabled:opacity-50"><Plus className="w-4 h-4 mr-1.5" /> As</button>
      </form>

      <div className="overflow-x-auto custom-scrollbar rounded-[28px]">
        <div ref={boardRef} className="board-surface relative min-w-[760px] h-[720px] rounded-[28px] border-[14px] border-[var(--wood-frame)] shadow-[inset_0_0_30px_rgba(0,0,0,0.35),0_24px_40px_-20px_rgba(70,40,20,0.55)] overflow-hidden">
          {notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-center font-hand text-3xl board-hint">Panon boş. Yukarıdan ilk hayalini as! 🌠</div>
          )}
          {notes.map((note, i) => {
            const drag = dragging === note.id;
            const pos = drag && dragPos ? dragPos : note;
            const isPhoto = note.kind === 'photo';
            return (
              <div
                key={note.id}
                onPointerDown={(e) => onPointerDown(e, note)}
                onPointerMove={(e) => onPointerMove(e, note)}
                onPointerUp={() => onPointerUp(note)}
                onDoubleClick={() => setEditing(note.id)}
                className={cn(
                  'absolute touch-none select-none group transition-shadow text-[#4a3f35]',
                  isPhoto ? 'w-40 sm:w-48 p-2.5 pb-3 bg-[#fdfcf8]' : 'w-44 sm:w-52 min-h-36 p-4 pt-7 rounded-sm',
                  drag ? 'cursor-grabbing shadow-[0_25px_50px_rgba(0,0,0,0.4)] z-10' : 'cursor-grab shadow-[0_12px_22px_-6px_rgba(0,0,0,0.4)]'
                )}
                style={{
                  left: `${pos.x}%`, top: `${pos.y}%`,
                  backgroundColor: isPhoto ? undefined : note.color,
                  transform: `rotate(${drag ? 0 : note.rotation}deg) scale(${drag ? 1.05 : 1})`,
                }}
              >
                {isPhoto ? (
                  <>
                    {/* Push pin */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full shadow-[0_3px_4px_rgba(0,0,0,0.4)]"
                      style={{ background: `radial-gradient(circle at 35% 30%, white -20%, ${PIN_COLORS[i % PIN_COLORS.length]} 45%, color-mix(in srgb, ${PIN_COLORS[i % PIN_COLORS.length]} 60%, black))` }} />
                    <div className="bg-black/10 shadow-inner overflow-hidden"><PolaroidPhoto note={note} /></div>
                  </>
                ) : (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/50 backdrop-blur-sm rotate-[-4deg] shadow-sm" />
                )}
                <div className={cn('flex items-start gap-2', isPhoto && 'mt-2.5 justify-center text-center')}>
                  {!isPhoto && <span className="text-2xl leading-none">{note.emoji}</span>}
                  {editing === note.id ? (
                    <textarea
                      autoFocus
                      defaultValue={note.text}
                      onBlur={(e) => { update(note.id, { text: e.target.value.trim() || note.text }); setEditing(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) (e.target as HTMLTextAreaElement).blur(); }}
                      className="flex-1 bg-white/40 rounded p-1 font-hand text-xl outline-none resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className={cn('flex-1 font-hand leading-6', isPhoto ? 'text-[22px]' : 'text-[22px]', note.done && 'opacity-60')}>{note.text}</p>
                  )}
                </div>
                {!isPhoto && <span className="block text-[10px] font-black uppercase tracking-wider opacity-50 mt-3">{note.kind === 'goal' ? 'Hedef' : 'Hayal'}</span>}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {note.kind === 'goal' && (
                    <button onClick={() => toggleDone(note)} aria-label="Tamamlandı" className={cn('p-1.5 rounded-md', note.done ? 'bg-[#2c5e4a] text-white' : 'bg-white/60 hover:bg-white/90')}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => removeNote(note)} aria-label="Sil" className="p-1.5 rounded-md bg-white/60 hover:bg-white/90 hover:text-[#c05c3e]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {note.done && <span className="achieved-stamp">BAŞARILDI</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
