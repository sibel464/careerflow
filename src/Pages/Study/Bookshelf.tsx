import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, X, Star, Trash2, Quote as QuoteIcon, BookOpen, Target, Pencil, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useCorner } from '../../Hooks/useCorner';
import { usePreferences } from '../../Hooks/PreferencesContext';
import { ShelfBook, BookStatus, BOOK_COLORS, STATUS_LABEL } from '../../Utils/corner';
import { fireConfetti } from '../../Utils/confetti';
import { cn } from '../../Utils/classNames';
import { DecorPicker } from '../../Components/DecorPicker';

const PER_SHELF = 9;

/** Stable pseudo-random number per book, so spines don't jump around between renders. */
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const pct = (b: ShelfBook) => (b.pages ? Math.min(b.read / b.pages, 1) : 0);

/** A front cover drawn from the book's color. */
const Cover: React.FC<{ book: ShelfBook; className?: string }> = ({ book, className }) => (
  <div className={cn('relative rounded-r-lg rounded-l-sm overflow-hidden shadow-[4px_6px_14px_rgba(0,0,0,0.25)] text-white flex flex-col justify-between p-3 shrink-0', className)}
    style={{ background: `linear-gradient(135deg, ${book.color}, color-mix(in srgb, ${book.color} 60%, black))` }}>
    <span className="absolute left-1.5 inset-y-0 w-px bg-white/25" />
    <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
    <p lang="tr" className="relative font-serif font-bold leading-tight text-[0.95em] line-clamp-4 hyphens-auto [overflow-wrap:anywhere]">{book.title}</p>
    <div className="relative">
      <span className="block w-6 h-0.5 bg-white/60 mb-1.5" />
      <p className="text-[0.62em] font-bold uppercase tracking-wider opacity-85 line-clamp-2">{book.author}</p>
    </div>
  </div>
);

const Stars: React.FC<{ value: number; onChange?: (v: number) => void; size?: string }> = ({ value, onChange, size = 'w-5 h-5' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i === value ? 0 : i)} aria-label={`${i} yıldız`}
        className={cn('transition-transform', onChange && 'hover:scale-125')}>
        <Star className={cn(size, i <= value ? 'fill-sun text-sun' : 'text-sand')} />
      </button>
    ))}
  </div>
);

export const Bookshelf: React.FC = () => {
  const { books, setBooks, bookGoal, setBookGoal } = useCorner();
  const { preferences } = usePreferences();
  const [filter, setFilter] = useState<BookStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ title: string; author: string; pages: number; status: BookStatus; color: string } | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);

  const year = new Date().getFullYear();
  const doneThisYear = books.filter(b => b.status === 'done' && b.finishedAt && parseISO(b.finishedAt).getFullYear() === year).length;
  const pagesRead = books.reduce((s, b) => s + b.read, 0);
  const reading = books.filter(b => b.status === 'reading');
  const allQuotes = books.flatMap(b => b.quotes.map(q => ({ ...q, book: b })));
  const [quoteSeed] = useState(() => Math.random());
  const featuredQuote = allQuotes.length ? allQuotes[Math.floor(quoteSeed * allQuotes.length)] : null;

  const shown = useMemo(() => {
    const order: Record<BookStatus, number> = { reading: 0, done: 1, want: 2 };
    return books.filter(b => filter === 'all' || b.status === filter).sort((a, b) => order[a.status] - order[b.status]);
  }, [books, filter]);
  const shelves = Array.from({ length: Math.max(1, Math.ceil(shown.length / PER_SHELF)) }, (_, i) => shown.slice(i * PER_SHELF, (i + 1) * PER_SHELF));
  const open = books.find(b => b.id === openId);

  const update = (id: string, patch: Partial<ShelfBook>) => {
    const b = books.find(x => x.id === id);
    if (!b) return;
    const next = { ...b, ...patch };
    // Finishing the last page finishes the book.
    if (next.read >= next.pages && next.pages > 0 && b.status !== 'done' && patch.status === undefined) next.status = 'done';
    if (next.status === 'done' && b.status !== 'done') {
      next.read = next.pages;
      next.finishedAt = format(new Date(), 'yyyy-MM-dd');
      if (preferences.celebrate) fireConfetti(120);
      toast.success(`📚 "${next.title}" bitti! Rafına bir kitap daha eklendi.`);
    }
    if (next.status === 'reading' && !next.startedAt) next.startedAt = format(new Date(), 'yyyy-MM-dd');
    if (next.status !== 'done') next.finishedAt = undefined;
    setBooks(prev => prev.map(x => (x.id === id ? next : x)));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adding?.title.trim()) return;
    setBooks(prev => [...prev, {
      id: uuidv4(), title: adding.title.trim(), author: adding.author.trim() || 'Bilinmeyen yazar', pages: Math.max(1, adding.pages), read: 0,
      status: adding.status, color: adding.color, rating: 0, quotes: [], createdAt: new Date().toISOString(),
      startedAt: adding.status === 'reading' ? format(new Date(), 'yyyy-MM-dd') : undefined,
    }]);
    setAdding(null);
  };

  const ring = 2 * Math.PI * 40;
  const goalP = Math.min(doneThisYear / Math.max(bookGoal, 1), 1);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Kitaplığım 📚</h1>
          <p className="text-ink-soft mt-2">{books.length} kitap · {pagesRead.toLocaleString('tr-TR')} sayfa okundu · {allQuotes.length} alıntı</p>
        </div>
        <div className="flex gap-2">
        <DecorPicker rows={['wood']} />
        <button onClick={() => setAdding({ title: '', author: '', pages: 250, status: 'want', color: BOOK_COLORS[books.length % BOOK_COLORS.length] })} className="btn-primary px-5 py-3 text-sm w-fit">
          <Plus className="w-4 h-4 mr-1.5" /> Kitap ekle
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Yearly goal */}
        <div className="glass-panel p-5 flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="9" className="stroke-sand/50" />
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-moss"
                strokeDasharray={ring} strokeDashoffset={ring * (1 - goalP)} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <b className="text-2xl font-black text-ink leading-none">{doneThisYear}</b>
              <span className="text-[11px] font-bold text-ink-muted">/ {bookGoal}</span>
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {year} okuma hedefi</p>
            {editingGoal ? (
              <form onSubmit={(e) => { e.preventDefault(); setEditingGoal(false); }} className="flex items-center gap-2 mt-2">
                <input type="number" min={1} max={365} autoFocus value={bookGoal} onChange={(e) => setBookGoal(Math.max(1, Number(e.target.value)))} className="w-20 px-3 py-1.5 glass-input rounded-lg text-ink font-bold" />
                <button className="btn-ghost p-2" aria-label="Kaydet"><Check className="w-4 h-4" /></button>
              </form>
            ) : (
              <p className="font-bold text-ink mt-1">{goalP >= 1 ? 'Hedef tamam! 🎉' : `${bookGoal - doneThisYear} kitap kaldı`}
                <button onClick={() => setEditingGoal(true)} className="ml-2 text-ink-muted hover:text-ink align-middle" aria-label="Hedefi düzenle"><Pencil className="w-3.5 h-3.5 inline" /></button>
              </p>
            )}
            <p className="text-sm text-ink-soft mt-1">Ayda ~{Math.max(1, Math.round(bookGoal / 12))} kitap yeter.</p>
          </div>
        </div>

        {/* Currently reading */}
        <div className="glass-panel p-5 lg:col-span-2">
          <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Şu an okuyorum</p>
          {reading.length === 0 ? (
            <p className="text-ink-soft text-sm py-6 text-center">Raftan bir kitap seç ve "Okuyorum" yap 📖</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reading.slice(0, 2).map(b => (
                <div key={b.id} className="flex gap-4 items-center">
                  <button onClick={() => setOpenId(b.id)} className="hover:-translate-y-1 transition-transform"><Cover book={b} className="w-16 h-24 text-[11px]" /></button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">{b.title}</p>
                    <p className="text-xs text-ink-muted truncate">{b.author}</p>
                    <div className="h-2 rounded-full bg-sand/50 mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(b) * 100}%`, background: b.color }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-ink-soft tabular-nums">{b.read}/{b.pages} · %{Math.round(pct(b) * 100)}</span>
                      <div className="flex gap-1">
                        {[10, 25].map(n => (
                          <button key={n} onClick={() => update(b.id, { read: Math.min(b.pages, b.read + n) })} className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-glass/70 text-ink-soft hover:text-ink hover:bg-glass">+{n}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {featuredQuote && (
        <figure className="glass-panel px-6 py-5 flex gap-4 items-start">
          <QuoteIcon className="w-8 h-8 text-moss/40 shrink-0 -scale-x-100" />
          <div>
            <blockquote className="font-hand text-2xl sm:text-3xl text-ink leading-snug">{featuredQuote.text}</blockquote>
            <figcaption className="text-sm text-ink-muted font-bold mt-1">— {featuredQuote.book.title}, {featuredQuote.book.author}</figcaption>
          </div>
        </figure>
      )}

      {/* Bookcase */}
      <div className="wood-case wood-grain rounded-3xl p-4 sm:p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.45),0_20px_40px_-20px_rgba(60,35,20,0.6)]">
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(['all', 'reading', 'want', 'done'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3.5 py-1.5 rounded-full text-xs font-black transition-colors', filter === f ? 'bg-[var(--wood-text)] text-[var(--wood-text-on)]' : 'text-[var(--wood-text)] opacity-80 hover:opacity-100 bg-black/15')}>
              {f === 'all' ? `Tümü · ${books.length}` : `${STATUS_LABEL[f]} · ${books.filter(b => b.status === f).length}`}
            </button>
          ))}
        </div>
        <div className="space-y-7">
          {shelves.map((row, i) => (
            <div key={i}>
              <div className="flex items-end gap-1 px-3 min-h-[210px] overflow-x-auto overflow-y-visible custom-scrollbar rounded-t-lg bg-black/20 pt-6 shadow-[inset_0_10px_18px_-8px_rgba(0,0,0,0.6)]">
                {row.length === 0 && <p className="text-[var(--wood-text)] opacity-60 text-sm font-bold self-center mx-auto">Bu rafta henüz kitap yok</p>}
                {row.map(b => {
                  const h = hash(b.id);
                  const height = 150 + (h % 45);
                  const width = Math.round(30 + Math.min(b.pages, 600) / 600 * 26);
                  return (
                    <button key={b.id} onClick={() => setOpenId(b.id)} title={`${b.title} — ${b.author}`}
                      className={cn('group relative shrink-0 rounded-t-[3px] rounded-b-[2px] text-white transition-transform duration-300 hover:-translate-y-3 focus-visible:-translate-y-3 origin-bottom',
                        h % 7 === 0 && 'rotate-[-4deg] ml-2 mr-1')}
                      style={{ height, width, background: `linear-gradient(90deg, color-mix(in srgb, ${b.color} 70%, black) 0%, ${b.color} 18%, color-mix(in srgb, ${b.color} 85%, white) 50%, ${b.color} 82%, color-mix(in srgb, ${b.color} 65%, black) 100%)`, boxShadow: '2px 0 4px rgba(0,0,0,0.35)' }}>
                      <span className="absolute top-3 inset-x-1 h-px bg-white/40" />
                      <span className="absolute top-4 inset-x-1 h-px bg-white/25" />
                      <span className="absolute bottom-4 inset-x-1 h-px bg-white/30" />
                      <span className="absolute inset-x-0 top-7 bottom-7 flex items-center justify-center">
                        <span className={cn('[writing-mode:vertical-rl] rotate-180 max-h-full font-serif font-bold leading-none tracking-wide overflow-hidden whitespace-nowrap text-ellipsis drop-shadow', b.title.length > 16 ? 'text-[10.5px]' : 'text-[12px]')}>{b.title}</span>
                      </span>
                      {b.status === 'reading' && <span className="absolute -top-1 right-1.5 w-2 h-9 bg-clay rounded-b-sm [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]" title="Okuyorum" />}
                      {b.status === 'done' && b.rating >= 4 && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px]">⭐</span>}
                      {b.status === 'want' && <span className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors rounded-t-[3px]" />}
                    </button>
                  );
                })}
                {i === shelves.length - 1 && <span className="shrink-0 text-3xl self-end ml-auto pl-4 pb-1 select-none" aria-hidden>{books.length % 2 ? '🪴' : '🕯️'}</span>}
              </div>
              <div className="h-4 rounded-b-md wood-plank shadow-[0_8px_12px_-4px_rgba(0,0,0,0.5)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Book detail */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setOpenId(null)} />
          <BookDetail book={open} onClose={() => setOpenId(null)} onUpdate={(p) => update(open.id, p)}
            onDelete={() => { setBooks(prev => prev.filter(b => b.id !== open.id)); setOpenId(null); }} />
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setAdding(null)} />
          <form onSubmit={add} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 animate-pop">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-serif text-ink">Rafa yeni kitap</h2>
              <button type="button" onClick={() => setAdding(null)} className="btn-ghost p-2" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-5">
              <Cover book={{ id: 'x', title: adding.title || 'Kitap adı', author: adding.author || 'Yazar', pages: adding.pages, read: 0, status: adding.status, color: adding.color, rating: 0, quotes: [], createdAt: '' }} className="w-28 h-40 text-sm hidden sm:flex" />
              <div className="flex-1 space-y-3">
                <input autoFocus value={adding.title} onChange={(e) => setAdding({ ...adding, title: e.target.value })} placeholder="Kitap adı" className="w-full px-4 py-2.5 glass-input rounded-xl text-ink font-bold" />
                <input value={adding.author} onChange={(e) => setAdding({ ...adding, author: e.target.value })} placeholder="Yazar" className="w-full px-4 py-2.5 glass-input rounded-xl text-ink" />
                <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">Sayfa
                  <input type="number" min={1} value={adding.pages} onChange={(e) => setAdding({ ...adding, pages: Number(e.target.value) })} className="w-24 px-3 py-2 glass-input rounded-xl text-ink" />
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {BOOK_COLORS.map(c => <button type="button" key={c} onClick={() => setAdding({ ...adding, color: c })} aria-label={`Renk ${c}`} className={cn('w-7 h-7 rounded-md border-2', adding.color === c ? 'border-ink scale-110' : 'border-transparent')} style={{ background: c }} />)}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4">
              {(['want', 'reading', 'done'] as const).map(s => (
                <button type="button" key={s} onClick={() => setAdding({ ...adding, status: s })} className={cn('flex-1 py-2 rounded-xl text-sm font-bold', adding.status === s ? 'bg-moss text-white' : 'bg-glass/60 text-ink-soft')}>{STATUS_LABEL[s]}</button>
              ))}
            </div>
            <div className="flex justify-end mt-5"><button type="submit" disabled={!adding.title.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Rafa koy</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

const BookDetail: React.FC<{ book: ShelfBook; onClose: () => void; onUpdate: (p: Partial<ShelfBook>) => void; onDelete: () => void }> = ({ book, onClose, onUpdate, onDelete }) => {
  const [quote, setQuote] = useState('');
  const addQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;
    onUpdate({ quotes: [...book.quotes, { id: uuidv4(), text: quote.trim(), page: book.read || undefined }] });
    setQuote('');
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={book.title} className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl bg-cream border border-glass/70 shadow-2xl animate-pop">
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6" style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${book.color} 18%, transparent), transparent 70%)` }}>
        <Cover book={book} className="w-32 h-48 text-base mx-auto sm:mx-0 rotate-[-3deg]" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold font-serif text-ink leading-tight">{book.title}</h2>
              <p className="text-ink-soft font-semibold">{book.author}</p>
            </div>
            <button onClick={onClose} className="btn-ghost p-2 shrink-0" aria-label="Kapat"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1.5 mt-4">
            {(['want', 'reading', 'done'] as const).map(s => (
              <button key={s} onClick={() => onUpdate({ status: s, read: s === 'want' ? 0 : book.read })} className={cn('flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors', book.status === s ? 'bg-moss text-white shadow' : 'bg-glass/60 text-ink-soft hover:text-ink')}>{STATUS_LABEL[s]}</button>
            ))}
          </div>
          {book.status !== 'want' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm font-bold text-ink-soft mb-1"><span>Sayfa {book.read} / {book.pages}</span><span>%{Math.round(pct(book) * 100)}</span></div>
              <input type="range" min={0} max={book.pages} value={book.read} onChange={(e) => onUpdate({ read: Number(e.target.value) })} className="w-full accent-[var(--color-moss)]" aria-label="Okunan sayfa" />
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <Stars value={book.rating} onChange={(rating) => onUpdate({ rating })} />
            <span className="text-xs text-ink-muted font-semibold">
              {book.finishedAt ? `Bitti: ${format(parseISO(book.finishedAt), 'd MMM yyyy', { locale: tr })}` : book.startedAt ? `Başladın: ${format(parseISO(book.startedAt), 'd MMM', { locale: tr })}` : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">Alıntılarım · {book.quotes.length}</h3>
        <div className="space-y-2.5">
          {book.quotes.map(q => (
            <div key={q.id} className="group flex gap-3 items-start p-3 rounded-2xl bg-glass/50 border-l-4" style={{ borderColor: book.color }}>
              <p className="font-hand text-xl text-ink leading-snug flex-1">“{q.text}”{q.page ? <span className="font-sans text-xs text-ink-muted font-bold ml-2">s. {q.page}</span> : null}</p>
              <button onClick={() => onUpdate({ quotes: book.quotes.filter(x => x.id !== q.id) })} className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-ink-muted hover:text-clay p-1" aria-label="Alıntıyı sil"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addQuote} className="flex gap-2 mt-3">
          <input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Altını çizdiğin bir cümle…" className="flex-1 px-4 py-2.5 glass-input rounded-xl text-ink" />
          <button disabled={!quote.trim()} className="btn-primary px-4 text-sm disabled:opacity-50"><Plus className="w-4 h-4" /></button>
        </form>
        <button onClick={onDelete} className="mt-6 text-xs font-bold text-ink-muted hover:text-clay flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Kitabı raftan kaldır</button>
      </div>
    </div>
  );
};
