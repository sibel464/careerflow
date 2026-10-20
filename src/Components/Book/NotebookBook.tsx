import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, Pencil, Eye, Pin, PinOff, Trash2, Plus, CheckSquare } from 'lucide-react';
import { Book, PageSide } from './Book';
import type { Note, Notebook } from '../../Pages/Study/Notebooks';
import { cn } from '../../Utils/classNames';

/** Renders "[ ]" / "[x]" lines as tappable checkboxes, everything else as handwriting-neat text. */
export const NoteLines: React.FC<{ body: string; onToggle?: (line: number) => void }> = ({ body, onToggle }) => (
  <div>
    {body.split('\n').map((line, i) => {
      const m = line.match(/^\s*\[( |x|X)\]\s?(.*)$/);
      if (m) {
        const done = m[1].toLowerCase() === 'x';
        return (
          <button key={i} onClick={() => onToggle?.(i)} className="flex items-center gap-2.5 text-left w-full min-h-8 group">
            <span className={cn('w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-colors', done ? 'bg-[#3a9a6e] border-[#3a9a6e] text-white' : 'border-[#a39684] group-hover:border-[#3a9a6e]')}>
              {done && <Check className="w-3 h-3" strokeWidth={3} />}
            </span>
            <span className={cn('text-[15px]', done ? 'line-through text-[#b3a491]' : 'text-[#3d3530]')}>{m[2]}</span>
          </button>
        );
      }
      return <p key={i} className="text-[15px] leading-8 min-h-8 text-[#3d3530] whitespace-pre-wrap">{line}</p>;
    })}
  </div>
);

interface NotebookBookProps {
  notebook: Notebook;
  notes: Note[];
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onAdd: () => string;
  onDelete: (id: string) => void;
}

const NotePage: React.FC<{ note: Note; number: number; side: PageSide; interactive: boolean; onUpdate: (c: Partial<Note>) => void; onDelete: () => void }> = ({ note, number, side, interactive, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(!note.body);
  const toggle = (line: number) => {
    const lines = note.body.split('\n');
    lines[line] = lines[line].replace(/\[( |x|X)\]/, m => (m === '[ ]' ? '[x]' : '[ ]'));
    onUpdate({ body: lines.join('\n') });
  };
  const checks = note.body.match(/^\s*\[( |x|X)\]/gm) ?? [];
  const done = checks.filter(c => /x/i.test(c)).length;

  return (
    <div inert={!interactive} className={cn('w-full h-full flex flex-col pt-8 pb-11', side === 'left' ? 'pl-9 pr-11' : 'pl-11 pr-9')}>
      <div className="flex items-start gap-2">
        <input value={note.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Sayfa başlığı"
          className="flex-1 min-w-0 bg-transparent font-hand text-[2.1rem] leading-tight text-[#3d3530] outline-none placeholder:text-[#d8cbb8]" />
        <div className="flex gap-0.5 pt-1">
          <button onClick={() => setEditing(e => !e)} title={editing ? 'Okuma görünümü' : 'Düzenle'} aria-label={editing ? 'Okuma görünümü' : 'Düzenle'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a39684] hover:bg-[#f5ecdc] hover:text-[#4a3f35]">
            {editing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
          <button onClick={() => onUpdate({ pinned: !note.pinned })} title={note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'} aria-label="Sabitle"
            className={cn('w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f5ecdc]', note.pinned ? 'text-[#c05c3e]' : 'text-[#a39684]')}>
            {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} title="Sayfayı sil" aria-label="Sayfayı sil" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a39684] hover:bg-[#f5ecdc] hover:text-[#c05c3e]">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] font-bold text-[#b3a491] mb-2 flex items-center gap-2">
        {format(parseISO(note.updatedAt), 'd MMMM yyyy', { locale: tr })}
        {checks.length > 0 && <span className="flex items-center gap-0.5"><CheckSquare className="w-3 h-3" />{done}/{checks.length}</span>}
        {note.pinned && <span>📌</span>}
      </p>
      {editing ? (
        <>
          <textarea
            autoFocus={interactive && !note.body}
            value={note.body}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder={'Yazmaya başla…\n\n"[ ] süt al" yazarsan tıklanabilir bir madde olur.'}
            className="book-lines book-scroll flex-1 min-h-0 w-full bg-transparent text-[15px] leading-8 text-[#3d3530] outline-none resize-none placeholder:text-[#cfc2ae]"
          />
          <button onClick={() => onUpdate({ body: note.body + (note.body && !note.body.endsWith('\n') ? '\n' : '') + '[ ] ' })}
            className="mt-2 self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#8a7560] px-2.5 py-1.5 rounded-lg hover:bg-[#f5ecdc]">
            <CheckSquare className="w-3.5 h-3.5" /> Madde ekle
          </button>
        </>
      ) : (
        <div onDoubleClick={() => setEditing(true)} className="book-lines book-scroll flex-1 min-h-0 overflow-y-auto" title="Düzenlemek için çift tıkla">
          <NoteLines body={note.body} onToggle={toggle} />
        </div>
      )}
      <span className="sr-only">Sayfa {number}</span>
    </div>
  );
};

/** A notebook you can read like a book: contents page, one note per page, a fresh page at the end. */
export const NotebookBook: React.FC<NotebookBookProps> = ({ notebook, notes, onUpdate, onAdd, onDelete }) => {
  const ordered = [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [index, setIndex] = useState(0);
  const last = ordered.length + 1; // contents + notes + one blank page

  const addAndOpen = () => {
    onAdd();
    // The new note becomes the last page; open the spread that contains it.
    setIndex(ordered.length + 1);
  };

  const renderPage = (i: number, side: PageSide, interactive: boolean) => {
    if (i === 0) {
      return (
        <div inert={!interactive} className="w-full h-full flex flex-col pt-10 pb-12 pl-10 pr-12">
          <span className="text-6xl">{notebook.emoji}</span>
          <h2 className="font-hand text-5xl mt-3 leading-none" style={{ color: notebook.color }}>{notebook.name}</h2>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b3a491] mt-6 mb-3">İçindekiler</p>
          <div className="flex-1 min-h-0 overflow-y-auto book-scroll pr-1">
            {ordered.length === 0 && <p className="font-hand text-2xl text-[#b3a491]">Henüz sayfa yok… ilkini yaz ✍️</p>}
            {ordered.map((n, k) => (
              <button key={n.id} onClick={() => setIndex(k + 1)} className="w-full flex items-baseline gap-2 py-1.5 text-left group">
                <span className="text-[15px] text-[#3d3530] group-hover:text-[#c05c3e] truncate">{n.pinned && '📌 '}{n.title || 'Başlıksız sayfa'}</span>
                <span className="flex-1 border-b border-dotted border-[#cfc2ae] translate-y-[-4px]" />
                <span className="font-serif italic text-sm text-[#a39684]">{k + 2}</span>
              </button>
            ))}
          </div>
          <button onClick={addAndOpen} className="mt-4 self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:brightness-110" style={{ backgroundColor: notebook.color }}>
            <Plus className="w-4 h-4" /> Yeni sayfa
          </button>
        </div>
      );
    }
    const note = ordered[i - 1];
    if (!note) {
      return (
        <div inert={!interactive} className="w-full h-full flex items-center justify-center">
          <button onClick={addAndOpen} className="flex flex-col items-center gap-3 text-[#b3a491] hover:text-[#8a6a4a] transition-colors group">
            <span className="w-20 h-20 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></span>
            <span className="font-hand text-3xl">Yeni bir sayfa aç</span>
          </button>
        </div>
      );
    }
    return <NotePage key={note.id} note={note} number={i + 1} side={side} interactive={interactive} onUpdate={(c) => onUpdate(note.id, c)} onDelete={() => onDelete(note.id)} />;
  };

  return (
    <Book
      index={Math.min(index, last)}
      onIndexChange={setIndex}
      minIndex={0}
      maxIndex={last}
      renderPage={renderPage}
      cover={notebook.color}
      pageLabel={(i) => (i <= ordered.length ? String(i + 1) : null)}
    />
  );
};
