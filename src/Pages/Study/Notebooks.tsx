import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Search, Pin, PinOff, Trash2, ArrowLeft, Pencil, CheckSquare, Eye, PenLine, Check, BookOpen, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import { ConfirmModal } from '../../Components/ConfirmModal';
import { NotebookBook } from '../../Components/Book/NotebookBook';
import { cn } from '../../Utils/classNames';

export const NOTEBOOKS_KEY = 'careerflow_notebooks';
export const NOTES_KEY = 'careerflow_notes';

export interface Notebook { id: string; name: string; emoji: string; color: string; createdAt: string }
export interface Note { id: string; notebookId: string; title: string; body: string; pinned: boolean; tint: string; createdAt: string; updatedAt: string }

const COVERS = ['#c05c3e', '#2c5e4a', '#4c58a8', '#d99a12', '#7a4a8a', '#c2577a', '#3f8f9a', '#6b4c3a'];
const EMOJIS = ['📒', '📓', '📕', '📗', '📘', '📙', '🧠', '💡', '🎨', '🎵', '✈️', '🍳', '💼', '🌱', '🔬', '📐'];
const TINTS = ['#ffffff', '#fff6d6', '#ffe4ea', '#e3f4e8', '#e4ecfb', '#efe4f7'];

const seedNotebooks = (): Notebook[] => {
  const now = new Date().toISOString();
  return [
    { id: 'nb-ideas', name: 'Fikirler', emoji: '💡', color: COVERS[3], createdAt: now },
    { id: 'nb-lessons', name: 'Kod Notları', emoji: '💻', color: COVERS[2], createdAt: now },
  ];
};
const seedNotes = (): Note[] => {
  const now = new Date().toISOString();
  return [
    { id: uuidv4(), notebookId: 'nb-ideas', title: 'Hoş geldin! 👋', body: 'Burası senin defterin.\n\n[x] İlk notu oku\n[ ] Kendi defterini oluştur\n[ ] Bir fikir yaz\n\nBir satırı "[ ]" ile başlatırsan tıklanabilir bir yapılacak olur ✨', pinned: true, tint: TINTS[1], createdAt: now, updatedAt: now },
    { id: uuidv4(), notebookId: 'nb-lessons', title: 'React hook kuralları', body: '• Hook\'lar sadece bileşenin en üstünde çağrılır\n• useState → durum tutar\n• useEffect → yan etkiler (fetch, abonelik)\n• Bağımlılık dizisini unutma! []', pinned: false, tint: TINTS[4], createdAt: now, updatedAt: now },
  ];
};

/** Renders a note body, turning "[ ]" / "[x]" lines into tappable checkboxes. */
const NoteBody: React.FC<{ body: string; onToggle: (lineIndex: number) => void }> = ({ body, onToggle }) => (
  <div className="space-y-1">
    {body.split('\n').map((line, i) => {
      const m = line.match(/^\s*\[( |x|X)\]\s?(.*)$/);
      if (m) {
        const done = m[1].toLowerCase() === 'x';
        return (
          <button key={i} onClick={() => onToggle(i)} className="flex items-start gap-2.5 text-left w-full group">
            <span className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors', done ? 'bg-moss border-moss text-white' : 'border-ink-muted group-hover:border-moss')}>
              {done && <Check className="w-3 h-3" strokeWidth={3} />}
            </span>
            <span className={cn('text-[15px] leading-relaxed', done ? 'line-through text-ink-muted' : 'text-ink')}>{m[2]}</span>
          </button>
        );
      }
      return line.trim() ? <p key={i} className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap">{line}</p> : <div key={i} className="h-3" />;
    })}
  </div>
);

export const Notebooks: React.FC = () => {
  const [notebooks, setNotebooks] = useLocalStorage<Notebook[]>(NOTEBOOKS_KEY, seedNotebooks);
  const [notes, setNotes] = useLocalStorage<Note[]>(NOTES_KEY, seedNotes);
  const [activeBook, setActiveBook] = useState<string | null>(() => notebooks[0]?.id ?? null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);
  const [view, setView] = useState<'book' | 'list'>('book');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<{ id?: string; name: string; emoji: string; color: string } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: 'book' | 'note'; id: string } | null>(null);

  const book = notebooks.find(b => b.id === activeBook) ?? null;
  const note = notes.find(n => n.id === activeNote) ?? null;
  const countFor = (id: string) => notes.filter(n => n.notebookId === id).length;

  const visibleNotes = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return notes
      .filter(n => (book ? n.notebookId === book.id : true))
      .filter(n => !q || (n.title + ' ' + n.body).toLocaleLowerCase('tr-TR').includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, book, query]);

  const saveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name.trim()) return;
    if (form.id) {
      setNotebooks(prev => prev.map(b => (b.id === form.id ? { ...b, name: form.name.trim(), emoji: form.emoji, color: form.color } : b)));
    } else {
      const id = uuidv4();
      setNotebooks(prev => [...prev, { id, name: form.name.trim(), emoji: form.emoji, color: form.color, createdAt: new Date().toISOString() }]);
      setActiveBook(id);
    }
    setForm(null);
  };

  const createNote = (bookId: string) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    setNotes(prev => [{ id, notebookId: bookId, title: '', body: '', pinned: false, tint: TINTS[0], createdAt: now, updatedAt: now }, ...prev]);
    return id;
  };

  const newNote = () => {
    const bookId = book?.id ?? notebooks[0]?.id;
    if (!bookId) { setForm({ name: '', emoji: EMOJIS[0], color: COVERS[0] }); return; }
    if (book && view === 'book') { createNote(bookId); return; }
    setActiveNote(createNote(bookId));
    setEditing(true);
  };

  const updateNote = (changes: Partial<Note>) => {
    if (!note) return;
    setNotes(prev => prev.map(n => (n.id === note.id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n)));
  };

  const toggleLine = (lineIndex: number) => {
    if (!note) return;
    const lines = note.body.split('\n');
    lines[lineIndex] = lines[lineIndex].replace(/\[( |x|X)\]/, m => (m === '[ ]' ? '[x]' : '[ ]'));
    updateNote({ body: lines.join('\n') });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    if (deleting.kind === 'note') {
      setNotes(prev => prev.filter(n => n.id !== deleting.id));
      setActiveNote(null);
    } else {
      setNotebooks(prev => prev.filter(b => b.id !== deleting.id));
      setNotes(prev => prev.filter(n => n.notebookId !== deleting.id));
      setActiveBook(null);
      setActiveNote(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-ink tracking-tight">Defterlerim 📒</h1>
          <p className="text-ink-soft mt-2">Her konuya ayrı bir defter. İstediğin ismi ver, notlarını içine yaz.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setForm({ name: '', emoji: EMOJIS[0], color: COVERS[notebooks.length % COVERS.length] })} className="btn-ghost px-4 py-2.5 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Yeni defter</button>
          <button onClick={newNote} className="btn-primary px-4 py-2.5 text-sm"><PenLine className="w-4 h-4 mr-1.5" /> Yeni not</button>
        </div>
      </div>

      {/* Bookshelf */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-2 px-1">
        <button
          onClick={() => { setActiveBook(null); setActiveNote(null); }}
          className={cn('shrink-0 w-28 h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all',
            !book ? 'border-moss bg-moss/10 text-moss' : 'border-sand text-ink-soft hover:bg-glass/50')}
        >
          <span className="text-3xl">🗂️</span>
          <span className="text-sm font-bold">Tüm notlar</span>
          <span className="text-[11px] font-bold opacity-70">{notes.length} not</span>
        </button>
        {notebooks.map(b => (
          <div key={b.id} className="relative shrink-0 group">
            <button
              onClick={() => { setActiveBook(b.id); setActiveNote(null); }}
              className={cn('notebook-cover w-28 h-36 rounded-r-2xl rounded-l-md text-left p-3 pl-5 flex flex-col justify-between text-white transition-all',
                activeBook === b.id ? '-translate-y-2 shadow-2xl ring-4 ring-white/70' : 'shadow-lg hover:-translate-y-1')}
              style={{ backgroundColor: b.color }}
            >
              <span className="text-3xl drop-shadow">{b.emoji}</span>
              <span>
                <span className="block font-serif font-bold leading-tight line-clamp-2">{b.name}</span>
                <span className="block text-[11px] font-bold opacity-80 mt-1">{countFor(b.id)} not</span>
              </span>
            </button>
            <button onClick={() => setForm({ id: b.id, name: b.name, emoji: b.emoji, color: b.color })} aria-label="Defteri düzenle"
              className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-ink-soft opacity-0 group-hover:opacity-100 focus:opacity-100 shadow"><Pencil className="w-3 h-3" /></button>
          </div>
        ))}
        <button onClick={() => setForm({ name: '', emoji: EMOJIS[0], color: COVERS[notebooks.length % COVERS.length] })}
          className="shrink-0 w-28 h-36 rounded-2xl bg-glass/40 border border-glass/70 flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-moss hover:bg-glass/70 transition-colors">
          <Plus className="w-7 h-7" /><span className="text-sm font-bold">Defter ekle</span>
        </button>
      </div>

      {book && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-hand text-3xl" style={{ color: book.color }}>{book.emoji} {book.name}</p>
          <div className="flex gap-1 p-1 rounded-xl bg-glass/50 border border-glass/70">
            {([['book', BookOpen, 'Defter'], ['list', List, 'Liste']] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
                className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all', view === v ? 'bg-moss text-white shadow-sm' : 'text-ink-soft hover:text-ink')}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {book && view === 'book' ? (
        <NotebookBook
          key={book.id}
          notebook={book}
          notes={notes.filter(n => n.notebookId === book.id)}
          onUpdate={(id, changes) => setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n)))}
          onAdd={() => createNote(book.id)}
          onDelete={(id) => setDeleting({ kind: 'note', id })}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Note list */}
        <div className={cn('lg:col-span-2 glass-panel p-4 space-y-3', note && 'hidden lg:block')}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={book ? `${book.name} içinde ara…` : 'Tüm notlarda ara…'} className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-sm text-ink" />
            </div>
            {book && <button onClick={() => setDeleting({ kind: 'book', id: book.id })} className="btn-ghost p-2.5" aria-label="Defteri sil" title="Defteri sil"><Trash2 className="w-4 h-4" /></button>}
          </div>
          {visibleNotes.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-2">🍃</span>
              <p className="text-sm font-bold text-ink-soft">{query ? 'Eşleşen not yok.' : 'Bu defter henüz boş.'}</p>
              {!query && <button onClick={newNote} className="mt-3 text-sm font-bold text-moss hover:underline">İlk notu yaz →</button>}
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {visibleNotes.map(n => {
                const nb = notebooks.find(b => b.id === n.notebookId);
                const checks = (n.body.match(/^\s*\[( |x|X)\]/gm) ?? []);
                const done = checks.filter(c => /x/i.test(c)).length;
                return (
                  <button key={n.id} onClick={() => { setActiveNote(n.id); setEditing(false); }}
                    className={cn('w-full text-left p-3.5 rounded-2xl border transition-all', activeNote === n.id ? 'border-moss shadow-md' : 'border-black/5 hover:shadow-md')}
                    style={{ backgroundColor: n.tint }}>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 font-bold text-[#3d3530] truncate">{n.title || 'Başlıksız not'}</p>
                      {n.pinned && <Pin className="w-3.5 h-3.5 text-[#c05c3e] fill-[#c05c3e] shrink-0" />}
                    </div>
                    <p className="text-xs text-[#6b5f55] line-clamp-2 mt-1 whitespace-pre-line">{n.body.replace(/\[( |x|X)\]/g, '•') || 'Boş not'}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-[#a38b76]">
                      {!book && nb && <span className="px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: nb.color }}>{nb.emoji} {nb.name}</span>}
                      {checks.length > 0 && <span className="flex items-center gap-0.5"><CheckSquare className="w-3 h-3" />{done}/{checks.length}</span>}
                      <span className="ml-auto">{format(parseISO(n.updatedAt), 'd MMM HH:mm', { locale: tr })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className={cn('lg:col-span-3', !note && 'hidden lg:block')}>
          {note ? (
            <div className="rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden" style={{ backgroundColor: note.tint }}>
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-black/5 bg-white/40">
                <button onClick={() => setActiveNote(null)} className="lg:hidden p-2 rounded-lg hover:bg-white/60 text-[#6b5f55]" aria-label="Listeye dön"><ArrowLeft className="w-4 h-4" /></button>
                <select value={note.notebookId} onChange={(e) => updateNote({ notebookId: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white/70 text-xs font-bold text-[#4a3f35] border border-black/5" aria-label="Defter">
                  {notebooks.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                </select>
                <div className="flex gap-1 ml-2">
                  {TINTS.map(t => <button key={t} onClick={() => updateNote({ tint: t })} aria-label="Not rengi" className={cn('w-5 h-5 rounded-full border', note.tint === t ? 'border-[#4a3f35] scale-110' : 'border-black/10')} style={{ backgroundColor: t }} />)}
                </div>
                <div className="ml-auto flex gap-1">
                  <button onClick={() => setEditing(e => !e)} className="p-2 rounded-lg hover:bg-white/60 text-[#6b5f55]" aria-label={editing ? 'Önizle' : 'Düzenle'} title={editing ? 'Önizle' : 'Düzenle'}>
                    {editing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                  <button onClick={() => updateNote({ pinned: !note.pinned })} className="p-2 rounded-lg hover:bg-white/60 text-[#6b5f55]" aria-label={note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}>
                    {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setDeleting({ kind: 'note', id: note.id })} className="p-2 rounded-lg hover:bg-white/60 text-[#c05c3e]" aria-label="Notu sil"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-6 sm:p-8 min-h-[480px]">
                <input value={note.title} onChange={(e) => updateNote({ title: e.target.value })} placeholder="Başlık" className="w-full bg-transparent font-serif text-3xl font-bold text-[#3d3530] outline-none placeholder:text-[#c9bfb2]" />
                <p className="text-[11px] font-bold text-[#a38b76] mt-1 mb-5">Son düzenleme {format(parseISO(note.updatedAt), 'd MMMM HH:mm', { locale: tr })}</p>
                {editing ? (
                  <>
                    <textarea
                      autoFocus={!note.body}
                      value={note.body}
                      onChange={(e) => updateNote({ body: e.target.value })}
                      placeholder={'Yazmaya başla…\n\nİpucu: "[ ] süt al" yazarsan tıklanabilir bir madde olur.'}
                      rows={Math.max(14, note.body.split('\n').length + 3)}
                      className="w-full bg-transparent text-[15px] leading-relaxed text-[#3d3530] outline-none resize-none placeholder:text-[#c9bfb2]"
                    />
                    <button onClick={() => updateNote({ body: note.body + (note.body && !note.body.endsWith('\n') ? '\n' : '') + '[ ] ' })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#6b5f55] px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white">
                      <CheckSquare className="w-3.5 h-3.5" /> Madde ekle
                    </button>
                  </>
                ) : (
                  <div onDoubleClick={() => setEditing(true)} title="Düzenlemek için çift tıkla">
                    {note.body ? <NoteBody body={note.body} onToggle={toggleLine} /> : <p className="text-[#a38b76] italic">Boş not — düzenlemek için çift tıkla.</p>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center">
              <span className="text-6xl block mb-3">📝</span>
              <p className="text-lg font-bold text-ink">Bir not seç ya da yenisini yaz</p>
              <button onClick={newNote} className="btn-primary mt-4 px-5 py-2.5 text-sm"><Plus className="w-4 h-4 mr-1.5" /> Yeni not</button>
            </div>
          )}
        </div>
      </div>
      )}

      {form && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={() => setForm(null)} />
          <form onSubmit={saveBook} role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-cream border border-glass/70 shadow-2xl p-6 space-y-5 animate-pop">
            <h2 className="text-xl font-bold font-serif text-ink">{form.id ? 'Defteri düzenle' : 'Yeni defter'} 📒</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-r-xl rounded-l-sm shadow-lg flex items-center justify-center text-4xl notebook-cover" style={{ backgroundColor: form.color }}>{form.emoji}</div>
              <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Defterin adı (örn: Tarif Defteri)" maxLength={30}
                className="flex-1 px-4 py-3 glass-input rounded-xl text-ink font-bold" />
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map(e => <button type="button" key={e} onClick={() => setForm({ ...form, emoji: e })} className={cn('aspect-square rounded-lg text-xl', form.emoji === e ? 'bg-moss/15 ring-2 ring-moss/50' : 'hover:bg-glass/60')}>{e}</button>)}
            </div>
            <div className="flex gap-2">
              {COVERS.map(c => <button type="button" key={c} onClick={() => setForm({ ...form, color: c })} aria-label={`Kapak rengi ${c}`} className={cn('w-8 h-8 rounded-full border-2', form.color === c ? 'border-ink scale-110' : 'border-white')} style={{ backgroundColor: c }} />)}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="btn-ghost px-4 py-2.5 text-sm">Vazgeç</button>
              <button type="submit" disabled={!form.name.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{form.id ? 'Kaydet' : 'Oluştur'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={deleting?.kind === 'book' ? 'Defteri sil' : 'Notu sil'}
        message={deleting?.kind === 'book' ? 'Bu defter ve içindeki tüm notlar silinecek. Emin misin?' : 'Bu not kalıcı olarak silinecek.'}
        confirmText="Evet, sil"
      />
    </div>
  );
};
