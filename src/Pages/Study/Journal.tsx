import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  addDays, addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ImagePlus, PenTool, Smile, Search, Trash2, X, Sparkles, Flame, BookOpen, StickyNote } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { useMedia } from '../../Hooks/useMedia';
import { saveMedia, deleteMedia, compressImage } from '../../Utils/mediaStore';
import { DrawingPad } from '../../Components/Journal/DrawingPad';
import { ConfirmModal } from '../../Components/ConfirmModal';
import { Book, PageSide } from '../../Components/Book/Book';
import { cn } from '../../Utils/classNames';

export const JOURNAL_KEY = 'careerflow_journal';

type Paper = 'lined' | 'grid' | 'dots' | 'plain';
interface MediaItem { id: string; kind: 'photo' | 'drawing'; caption: string; rotation: number }
interface Sticker { id: string; emoji: string; x: number; y: number; rotation: number }

export interface JournalEntry {
  date: string;
  title: string;
  body: string;
  mood: string;
  paper: Paper;
  media: MediaItem[];
  stickers: Sticker[];
  updatedAt: string;
}

const MOODS = ['🥰', '😊', '🙂', '😐', '😴', '😢', '😤', '🤩'];
const STICKERS = ['🌸', '🌻', '🍀', '⭐', '🌙', '☀️', '🌈', '🦋', '🐝', '🍓', '🍒', '☕', '🧋', '📚', '✏️', '🎧', '💌', '💖', '✨', '🎀', '🐱', '🐶', '🦊', '🍄'];
const PROMPTS = [
  'Bugün seni en çok ne gülümsetti?',
  'Bugün öğrendiğin küçük ama güzel bir şey?',
  'Kendinle gurur duyduğun bir an?',
  'Yarın için tek bir hedefin ne?',
  'Bugün kime teşekkür etmek istersin?',
  'Şu an aklında en çok ne var?',
  'Bugünü üç kelimeyle anlat…',
  'Bir yıl sonraki sana küçük bir not bırak.',
];
const PAPERS: Paper[] = ['lined', 'grid', 'dots', 'plain'];
const PAPER_LABEL: Record<Paper, string> = { lined: 'Çizgili', grid: 'Kareli', dots: 'Noktalı', plain: 'Düz' };
const PAPER_CLASS: Record<Paper, string> = {
  lined: 'book-lines',
  grid: 'bg-[linear-gradient(rgba(79,134,192,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(79,134,192,0.14)_1px,transparent_1px)] bg-[length:1.25rem_1.25rem] [background-attachment:local]',
  dots: 'bg-[radial-gradient(rgba(107,76,58,0.25)_1.1px,transparent_1.3px)] bg-[length:1.25rem_1.25rem] [background-attachment:local]',
  plain: '',
};

/** Page 0 of the journal book. */
const BASE = new Date(2024, 0, 1);
const dateOf = (i: number) => format(addDays(BASE, i), 'yyyy-MM-dd');
const indexOf = (date: string) => differenceInCalendarDays(parseISO(date), BASE);

const emptyEntry = (date: string): JournalEntry => ({ date, title: '', body: '', mood: '', paper: 'lined', media: [], stickers: [], updatedAt: '' });
const isEmpty = (e: JournalEntry) => !e.title.trim() && !e.body.trim() && !e.mood && !e.media.length && !e.stickers.length;

/** A sticker dropped near the top-right of the page, slightly tilted. */
const newSticker = (emoji: string): Sticker => ({
  id: uuidv4(), emoji, x: 55 + Math.random() * 30, y: 10 + Math.random() * 25, rotation: Math.round(Math.random() * 30 - 15),
});
const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
const tilt = () => Math.round(Math.random() * 8 - 4);

const Polaroid: React.FC<{ item: MediaItem; interactive: boolean; onOpen: (src: string) => void; onRemove: () => void; onCaption: (c: string) => void }> = ({ item, interactive, onOpen, onRemove, onCaption }) => {
  const src = useMedia(item.id);
  return (
    <figure className="group relative shrink-0 w-32 bg-white p-1.5 pb-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 hover:z-10" style={{ transform: `rotate(${item.rotation}deg)` }}>
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-[#fde9b8]/85 rotate-[-4deg] shadow-sm" />
      <button onClick={() => src && onOpen(src)} className="block w-full aspect-square bg-[#f3efe6] overflow-hidden" tabIndex={interactive ? 0 : -1}>
        {src ? <img src={src} alt={item.caption || (item.kind === 'drawing' ? 'Çizim' : 'Fotoğraf')} className="w-full h-full object-cover" /> : <span className="block w-full h-full animate-pulse" />}
      </button>
      <input value={item.caption} onChange={(e) => onCaption(e.target.value)} placeholder="not…" readOnly={!interactive}
        className="w-full bg-transparent text-center font-hand text-lg text-[#4a3f35] outline-none placeholder:text-[#c4b6a3]" />
      {interactive && (
        <button onClick={onRemove} aria-label="Kaldır" className="absolute top-0.5 right-0.5 p-1 rounded-full bg-white/95 text-[#c05c3e] opacity-0 group-hover:opacity-100 focus:opacity-100 shadow">
          <X className="w-3 h-3" />
        </button>
      )}
    </figure>
  );
};

interface PageProps {
  date: string;
  entry: JournalEntry;
  side: PageSide;
  interactive: boolean;
  update: (changes: Partial<JournalEntry>) => void;
  onAddPhotos: (files: File[]) => void;
  onDraw: () => void;
  onRemoveMedia: (id: string) => void;
  onOpen: (src: string) => void;
  onClear: () => void;
}

/** One day = one page of the journal. */
const JournalPage: React.FC<PageProps> = ({ date, entry, side, interactive, update, onAddPhotos, onDraw, onRemoveMedia, onOpen, onClear }) => {
  const day = parseISO(date);
  const [menu, setMenu] = useState<'mood' | 'stickers' | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [prompt] = useState(randomPrompt);
  const words = entry.body.trim().split(/\s+/).filter(Boolean).length;

  const onStickerDown = (e: React.PointerEvent, s: Sticker) => {
    if (!interactive) return;
    e.stopPropagation();
    const page = pageRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = { id: s.id, dx: e.clientX - (page.left + (s.x / 100) * page.width), dy: e.clientY - (page.top + (s.y / 100) * page.height) };
  };
  const onStickerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !pageRef.current) return;
    const page = pageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(90, ((e.clientX - dragging.current.dx - page.left) / page.width) * 100));
    const y = Math.max(0, Math.min(92, ((e.clientY - dragging.current.dy - page.top) / page.height) * 100));
    const id = dragging.current.id;
    update({ stickers: entry.stickers.map(s => (s.id === id ? { ...s, x, y } : s)) });
  };

  const tools = [
    { icon: PenTool, label: 'Çizim yap', onClick: onDraw },
    { icon: Sparkles, label: 'Bana bir soru sor', onClick: () => update({ body: entry.body + (entry.body ? '\n\n' : '') + `✨ ${randomPrompt()}\n` }) },
    { icon: StickyNote, label: `Kâğıt: ${PAPER_LABEL[entry.paper]}`, onClick: () => update({ paper: PAPERS[(PAPERS.indexOf(entry.paper) + 1) % PAPERS.length] }) },
  ];

  return (
    <div
      ref={pageRef}
      inert={!interactive}
      onPointerMove={onStickerMove}
      onPointerUp={() => { dragging.current = null; }}
      className={cn('relative w-full h-full flex flex-col', side === 'left' ? 'pl-9 pr-10' : 'pl-10 pr-9', 'pt-7 pb-10')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn('font-hand leading-none text-[2.6rem]', isToday(day) ? 'text-[#c05c3e]' : 'text-[#8a6a4a]')}>{format(day, 'd MMMM', { locale: tr })}</p>
          <p className="font-hand text-xl text-[#a39684] capitalize -mt-0.5">{format(day, 'EEEE', { locale: tr })}{isToday(day) && ' · bugün'}</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenu(m => (m === 'mood' ? null : 'mood'))} aria-label="Ruh hali"
            className={cn('w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-2xl transition-transform hover:scale-110',
              entry.mood ? 'border-transparent bg-[#fdf1d6] shadow-sm' : 'border-[#d9cbb5] text-[#c4b6a3]')}>
            {entry.mood || <Smile className="w-5 h-5" />}
          </button>
          {menu === 'mood' && (
            <div className="absolute right-0 top-full mt-2 z-30 flex gap-0.5 p-1.5 rounded-2xl bg-white shadow-xl border border-[#ece3d2] animate-pop">
              {MOODS.map(m => (
                <button key={m} onClick={() => { update({ mood: entry.mood === m ? '' : m }); setMenu(null); }}
                  className={cn('w-9 h-9 rounded-xl text-xl hover:bg-[#fdf5e6] hover:scale-110 transition-transform', entry.mood === m && 'bg-[#fde9b8]')}>{m}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input value={entry.title} onChange={(e) => update({ title: e.target.value })} placeholder="Bugünün başlığı…"
        className="mt-3 w-full bg-transparent font-hand text-3xl text-[#3d3530] outline-none placeholder:text-[#d8cbb8]" />

      <textarea
        value={entry.body}
        onChange={(e) => update({ body: e.target.value })}
        placeholder={`${prompt}\n\nSevgili günlük…`}
        className={cn('book-scroll mt-1 flex-1 min-h-0 w-full bg-transparent font-hand text-[1.4rem] leading-8 text-[#3d3530] outline-none resize-none placeholder:text-[#cfc2ae]', PAPER_CLASS[entry.paper])}
      />

      {entry.media.length > 0 && (
        <div className="book-scroll flex gap-4 overflow-x-auto pt-4 pb-2 px-1 -mx-1">
          {entry.media.map(m => (
            <Polaroid key={m.id} item={m} interactive={interactive} onOpen={onOpen} onRemove={() => onRemoveMedia(m.id)}
              onCaption={(caption) => update({ media: entry.media.map(x => (x.id === m.id ? { ...x, caption } : x)) })} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 pt-3 border-t border-dashed border-[#e6dccb] mt-2">
        <input id={`photo-${date}`} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onAddPhotos(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        <label htmlFor={`photo-${date}`} title="Fotoğraf ekle" aria-label="Fotoğraf ekle"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8a7560] hover:bg-[#f5ecdc] hover:text-[#4a3f35] transition-colors cursor-pointer">
          <ImagePlus className="w-[18px] h-[18px]" />
        </label>
        {tools.map(t => (
          <button key={t.label} onClick={t.onClick} title={t.label} aria-label={t.label}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8a7560] hover:bg-[#f5ecdc] hover:text-[#4a3f35] transition-colors">
            <t.icon className="w-[18px] h-[18px]" />
          </button>
        ))}
        <div className="relative">
          <button onClick={() => setMenu(m => (m === 'stickers' ? null : 'stickers'))} title="Çıkartma" aria-label="Çıkartma"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-[#f5ecdc] transition-colors">🌸</button>
          {menu === 'stickers' && (
            <div className="absolute bottom-full mb-2 left-0 w-64 p-2.5 rounded-2xl bg-white shadow-xl border border-[#ece3d2] grid grid-cols-8 gap-0.5 z-30 animate-pop">
              {STICKERS.map(s => (
                <button key={s} onClick={() => update({ stickers: [...entry.stickers, newSticker(s)] })} className="text-xl rounded-lg hover:bg-[#fdf5e6] hover:scale-125 transition-transform">{s}</button>
              ))}
            </div>
          )}
        </div>
        <span className="ml-auto text-[11px] font-bold text-[#b3a491]">{words ? `${words} kelime` : ''}</span>
        {!isEmpty(entry) && (
          <button onClick={onClear} title="Sayfayı temizle" aria-label="Sayfayı temizle" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c4b6a3] hover:text-[#c05c3e] hover:bg-[#f5ecdc]">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {entry.stickers.map(s => (
        <span
          key={s.id}
          role="button"
          tabIndex={-1}
          onPointerDown={(e) => onStickerDown(e, s)}
          onDoubleClick={() => update({ stickers: entry.stickers.filter(x => x.id !== s.id) })}
          title="Sürükle · kaldırmak için çift tıkla"
          className="absolute text-[2.6rem] leading-none cursor-grab active:cursor-grabbing touch-none select-none drop-shadow-[0_3px_2px_rgba(0,0,0,0.22)] hover:scale-110 transition-transform z-20"
          style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.rotation}deg)` }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
};

export const Journal: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<Record<string, JournalEntry>>(JOURNAL_KEY, {});
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  // Today's page opens on the left when it can, otherwise on the right next to yesterday.
  // ?date=yyyy-MM-dd (e.g. from the calendar) opens that day's page.
  const [params] = useSearchParams();
  const linked = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') ?? '') && indexOf(params.get('date')!) >= 0 ? params.get('date')! : null;
  const [pageIndex, setPageIndex] = useState(() => indexOf(linked ?? todayKey));
  const [month, setMonth] = useState(() => startOfMonth(linked ? parseISO(linked) : new Date()));
  const [drawingFor, setDrawingFor] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clearing, setClearing] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const updateFor = (date: string) => (changes: Partial<JournalEntry>) => {
    setEntries(prev => {
      const next = { ...(prev[date] ?? emptyEntry(date)), ...changes, updatedAt: new Date().toISOString() };
      const copy = { ...prev };
      if (isEmpty(next)) delete copy[date];
      else copy[date] = next;
      return copy;
    });
  };

  const attach = (date: string, item: MediaItem) =>
    setEntries(prev => {
      const base = prev[date] ?? emptyEntry(date);
      return { ...prev, [date]: { ...base, media: [...base.media, item], updatedAt: new Date().toISOString() } };
    });

  const addPhotos = (date: string) => async (files: File[]) => {
    for (const file of files) {
      try {
        const id = uuidv4();
        await saveMedia(id, await compressImage(file));
        attach(date, { id, kind: 'photo', caption: '', rotation: tilt() });
      } catch {
        toast.error('Bu görsel eklenemedi. 🍂');
      }
    }
  };

  const saveDrawing = async (dataUrl: string) => {
    if (!drawingFor) return;
    const id = uuidv4();
    await saveMedia(id, dataUrl);
    attach(drawingFor, { id, kind: 'drawing', caption: '', rotation: tilt() });
    setDrawingFor(null);
    toast.success('Çizimin sayfaya yapıştırıldı 🎨');
  };

  const removeMedia = (date: string) => (id: string) => {
    deleteMedia(id).catch(() => undefined);
    const e = entries[date];
    if (e) updateFor(date)({ media: e.media.filter(m => m.id !== id) });
  };

  const clearPage = () => {
    if (!clearing) return;
    entries[clearing]?.media.forEach(m => deleteMedia(m.id).catch(() => undefined));
    setEntries(prev => {
      const copy = { ...prev };
      delete copy[clearing];
      return copy;
    });
  };

  const changePage = useCallback((i: number) => {
    setPageIndex(i);
    setMonth(startOfMonth(parseISO(dateOf(i))));
  }, []);

  const jumpTo = (date: string) => {
    setPageIndex(indexOf(date));
    setMonth(startOfMonth(parseISO(date)));
  };

  const streak = useMemo(() => {
    let n = 0;
    let cursor = new Date();
    if (!entries[format(cursor, 'yyyy-MM-dd')]) cursor = addDays(cursor, -1);
    while (entries[format(cursor, 'yyyy-MM-dd')]) { n++; cursor = addDays(cursor, -1); }
    return n;
  }, [entries]);

  const results = query.trim()
    ? Object.values(entries)
        .filter(e => (e.title + ' ' + e.body).toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')))
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const calendarDays = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const openDates = [dateOf(pageIndex), dateOf(pageIndex + 1)];

  const renderPage = (i: number, side: PageSide, interactive: boolean) => {
    const date = dateOf(i);
    return (
      <JournalPage
        date={date}
        entry={entries[date] ?? emptyEntry(date)}
        side={side}
        interactive={interactive}
        update={updateFor(date)}
        onAddPhotos={addPhotos(date)}
        onDraw={() => setDrawingFor(date)}
        onRemoveMedia={removeMedia(date)}
        onOpen={setLightbox}
        onClear={() => setClearing(date)}
      />
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Günlüğüm 📔</h1>
          <p className="text-ink-soft mt-2">Her gün bir sayfa. Yaz, çiz, fotoğraf yapıştır, sayfaları çevir.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-panel px-4 py-2.5 rounded-2xl text-center">
            <p className="text-xl font-black text-clay flex items-center gap-1 justify-center"><Flame className="w-4 h-4" />{streak}</p>
            <p className="text-[10px] font-bold uppercase text-ink-muted">gün seri</p>
          </div>
          <div className="glass-panel px-4 py-2.5 rounded-2xl text-center">
            <p className="text-xl font-black text-moss flex items-center gap-1 justify-center"><BookOpen className="w-4 h-4" />{Object.keys(entries).length}</p>
            <p className="text-[10px] font-bold uppercase text-ink-muted">dolu sayfa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Compact date bar for smaller screens */}
        <div className="2xl:hidden flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 glass-panel px-3 py-2 rounded-2xl text-sm font-bold text-ink-soft">
            📅
            <input type="date" value={dateOf(pageIndex)} onChange={(e) => e.target.value && jumpTo(e.target.value)} className="bg-transparent text-ink outline-none" aria-label="Tarihe git" />
          </label>
          {!openDates.includes(todayKey) && <button onClick={() => jumpTo(todayKey)} className="btn-ghost px-3 py-2 text-sm">Bugün</button>}
        </div>

        <aside className="hidden 2xl:block glass-panel p-5 space-y-5 sticky top-0">
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonth(m => subMonths(m, 1))} className="btn-ghost p-1.5" aria-label="Önceki ay"><ChevronLeft className="w-4 h-4" /></button>
              <p className="font-serif font-bold text-ink capitalize">{format(month, 'MMMM yyyy', { locale: tr })}</p>
              <button onClick={() => setMonth(m => addMonths(m, 1))} className="btn-ghost p-1.5" aria-label="Sonraki ay"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center max-w-sm mx-auto">
              {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => <span key={i} className="text-[10px] font-black text-ink-muted">{d}</span>)}
              {calendarDays.map(d => {
                const key = format(d, 'yyyy-MM-dd');
                const has = entries[key];
                const open = openDates.includes(key);
                return (
                  <button key={key} onClick={() => jumpTo(key)}
                    className={cn('relative aspect-square rounded-lg text-xs font-bold transition-colors',
                      !isSameMonth(d, month) && 'opacity-30',
                      open ? 'bg-moss text-white' : isToday(d) ? 'ring-2 ring-clay/50 text-ink' : 'text-ink-soft hover:bg-glass/60')}>
                    {has?.mood ? <span className="text-sm">{has.mood}</span> : d.getDate()}
                    {has && !has.mood && <span className={cn('absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full', open ? 'bg-white' : 'bg-clay')} />}
                  </button>
                );
              })}
            </div>
            {!openDates.includes(todayKey) && (
              <button onClick={() => jumpTo(todayKey)} className="mt-3 w-full text-sm font-bold text-moss hover:underline">Bugünün sayfasına git →</button>
            )}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sayfalarda ara…" className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-sm text-ink" />
          </div>
          {query.trim() && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {results.length === 0 && <p className="text-xs font-bold text-ink-muted text-center py-3">Bulunamadı 🍂</p>}
              {results.map(r => (
                <button key={r.date} onClick={() => jumpTo(r.date)} className="w-full text-left p-2.5 rounded-xl hover:bg-glass/60">
                  <p className="text-xs font-black text-moss">{r.mood} {format(parseISO(r.date), 'd MMMM yyyy', { locale: tr })}</p>
                  <p className="text-sm font-bold text-ink truncate">{r.title || r.body.slice(0, 40) || 'Başlıksız sayfa'}</p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <Book
          index={pageIndex}
          onIndexChange={changePage}
          minIndex={0}
          maxIndex={indexOf(todayKey) + 366}
          renderPage={renderPage}
          cover="#7a3b2e"
          pageLabel={(i) => format(addDays(BASE, i), 'd.MM.yyyy')}
        />
      </div>

      {drawingFor && <DrawingPad onSave={saveDrawing} onClose={() => setDrawingFor(null)} />}
      {lightbox && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-6 animate-fade-in" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Büyük görünüm" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
      <ConfirmModal
        isOpen={clearing !== null}
        onClose={() => setClearing(null)}
        onConfirm={clearPage}
        title="Sayfayı temizle"
        message="Bu günün yazısı, fotoğrafları ve çizimleri silinecek. Emin misin?"
        confirmText="Evet, temizle"
      />
    </div>
  );
};
