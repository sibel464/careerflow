import React, { useEffect, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../Utils/supabase';
import { PROFILE_FIELDS, Profile } from '../../Utils/chat';
import { ChatAvatar } from './Messenger';
import { cn } from '../../Utils/classNames';

interface Props { mode: 'direct' | 'group'; meId: string; onClose: () => void; onOpened: (chatId: string) => void }

/** Find friends by name or @username — start a chat, or pick several for a group. */
export const NewChatDialog: React.FC<Props> = ({ mode, meId, onClose, onOpened }) => {
  const sb = supabase!;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [picked, setPicked] = useState<Profile[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = query.trim().replace(/^@/, '').replace(/[%_,()]/g, '');
    const timer = window.setTimeout(async () => {
      let req = sb.from('profiles').select(PROFILE_FIELDS).neq('id', meId).order('display_name').limit(30);
      if (q) req = req.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
      const { data } = await req;
      setResults((data ?? []) as Profile[]);
    }, 250);
    return () => clearTimeout(timer);
  }, [sb, meId, query]);

  const startDirect = async (p: Profile) => {
    setBusy(true);
    const { data, error } = await sb.rpc('start_direct_chat', { other: p.id });
    setBusy(false);
    if (error || !data) toast.error('Sohbet açılamadı.');
    else onOpened(data as string);
  };

  const createGroup = async () => {
    if (!title.trim() || picked.length === 0) return;
    setBusy(true);
    const { data, error } = await sb.rpc('create_group', { group_title: title, member_ids: picked.map(p => p.id) });
    setBusy(false);
    if (error || !data) toast.error('Grup kurulamadı.');
    else onOpened(data as string);
  };

  const toggle = (p: Profile) => setPicked(prev => (prev.some(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-ink/30 backdrop-blur-md" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-cream border border-glass/70 shadow-2xl animate-pop overflow-hidden">
        <header className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-xl font-bold font-serif text-ink">{mode === 'direct' ? 'Yeni sohbet' : 'Yeni grup'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-glass/60 text-ink-soft" aria-label="Kapat"><X className="w-5 h-5" /></button>
        </header>

        <div className="px-5 pt-4 space-y-3">
          {mode === 'group' && (
            <input value={title} onChange={e => setTitle(e.target.value.slice(0, 40))} placeholder="Grup adı (ör. Algoritma çalışma grubu)" className="w-full px-4 py-3 glass-input rounded-xl text-ink font-bold" />
          )}
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-input">
            <Search className="w-4 h-4 text-ink-muted" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="İsim ya da @kullanıcıadı" className="flex-1 bg-transparent outline-none text-sm font-semibold text-ink" />
          </label>
          {picked.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {picked.map(p => (
                <button key={p.id} onClick={() => toggle(p)} className="flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full bg-moss/15 text-moss text-xs font-bold">
                  {p.avatar} {p.display_name} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-3 px-2">
          {results.length === 0 && <p className="text-center text-sm font-semibold text-ink-muted py-8">Kimse bulunamadı. Arkadaşın Sibilia'da kayıt oldu mu? 🙂</p>}
          {results.map(p => {
            const on = picked.some(x => x.id === p.id);
            return (
              <button key={p.id} disabled={busy} onClick={() => (mode === 'direct' ? startDirect(p) : toggle(p))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass/60 text-left disabled:opacity-60">
                <ChatAvatar emoji={p.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{p.display_name}</p>
                  <p className="text-xs font-semibold text-ink-muted truncate">@{p.username}</p>
                </div>
                {mode === 'group' && (
                  <span className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', on ? 'bg-moss border-moss text-white' : 'border-ink-muted/40')}>
                    {on && <Check className="w-4 h-4" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {mode === 'group' && (
          <div className="p-4 border-t border-glass/60">
            <button onClick={createGroup} disabled={busy || !title.trim() || picked.length === 0} className="btn-primary w-full py-3 disabled:opacity-50">
              Grubu kur {picked.length > 0 && `(${picked.length + 1} kişi)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
