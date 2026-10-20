import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Search, SquarePen, Users, Copy, CheckCheck, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../Utils/supabase';
import { ChatRow, Member, PROFILE_FIELDS, Profile, chatInfo, listTime } from '../../Utils/chat';
import { ChatWindow } from './ChatWindow';
import { NewChatDialog } from './NewChatDialog';
import { cn } from '../../Utils/classNames';

export const ChatAvatar: React.FC<{ emoji: string; online?: boolean; size?: 'sm' | 'md' }> = ({ emoji, online, size = 'md' }) => (
  <span className={cn('relative shrink-0 rounded-full bg-sand/50 border border-glass/80 flex items-center justify-center', size === 'md' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl')}>
    {emoji}
    {online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] ring-2 ring-cream" aria-label="çevrimiçi" />}
  </span>
);

/** WhatsApp-style messenger: chat list on the left, the open conversation on the right. */
export const Messenger: React.FC<{ meId: string }> = ({ meId }) => {
  const sb = supabase!;
  const [me, setMe] = useState<Profile | null>(null);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [online, setOnline] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<'direct' | 'group' | null>(null);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    const [c, m] = await Promise.all([
      sb.rpc('my_chats'),
      sb.from('chat_members').select(`chat_id, user_id, last_read_at, profiles(${PROFILE_FIELDS})`),
    ]);
    if (c.data) setChats(c.data as ChatRow[]);
    if (m.data) setMembers(m.data as unknown as Member[]);
    setLoaded(true);
  }, [sb]);

  useEffect(() => {
    sb.from('profiles').select(PROFILE_FIELDS).eq('id', meId).single().then(({ data }) => data && setMe(data as Profile));
  }, [sb, meId]);

  // Keep the list live: new messages, new chats, read receipts.
  useEffect(() => {
    const channel = sb.channel('inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_members' }, () => refresh())
      .subscribe(status => { if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR') refresh(); });
    return () => { sb.removeChannel(channel); };
  }, [sb, refresh]);

  // Who is online right now.
  useEffect(() => {
    const channel = sb.channel('online', { config: { presence: { key: meId } } });
    channel
      .on('presence', { event: 'sync' }, () => setOnline(new Set(Object.keys(channel.presenceState()))))
      .subscribe(status => { if (status === 'SUBSCRIBED') channel.track({ at: Date.now() }); });
    return () => { sb.removeChannel(channel); };
  }, [sb, meId]);

  const rows = useMemo(() => chats
    .map(c => ({ chat: c, info: chatInfo(c, members, meId) }))
    .filter(r => r.info.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))), [chats, members, meId, query]);

  const active = chats.find(c => c.id === activeId) ?? null;
  const opened = (id: string) => { setActiveId(id); setDialog(null); refresh(); };

  const copyUsername = () => {
    if (!me) return;
    navigator.clipboard?.writeText(`@${me.username}`).then(() => toast.success('Kullanıcı adın kopyalandı, arkadaşına gönder 💌'), () => {});
  };

  return (
    <div className="glass-panel !rounded-[28px] overflow-hidden flex h-full min-h-[420px]">
      {/* Chat list */}
      <aside className={cn('w-full md:w-[340px] xl:w-[400px] md:shrink-0 flex flex-col border-r border-glass/60 bg-glass/30', active && 'hidden md:flex')}>
        <header className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-glass/60">
          <ChatAvatar emoji={me?.avatar ?? '🙂'} size="sm" />
          <button onClick={copyUsername} className="min-w-0 text-left group" title="Kullanıcı adını kopyala">
            <p className="font-black text-ink truncate leading-tight">{me?.display_name ?? '…'}</p>
            <p className="text-[11px] font-bold text-ink-muted truncate flex items-center gap-1">@{me?.username} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" /></p>
          </button>
          <div className="ml-auto flex gap-1">
            <button onClick={() => setDialog('direct')} className="p-2 rounded-full text-ink-soft hover:bg-glass/70" title="Yeni sohbet" aria-label="Yeni sohbet"><SquarePen className="w-5 h-5" /></button>
            <button onClick={() => setDialog('group')} className="p-2 rounded-full text-ink-soft hover:bg-glass/70" title="Yeni grup" aria-label="Yeni grup"><Users className="w-5 h-5" /></button>
            <button onClick={() => sb.auth.signOut()} className="p-2 rounded-full text-ink-soft hover:bg-glass/70" title="Çıkış yap" aria-label="Çıkış yap"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-3 shrink-0">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl glass-input">
            <Search className="w-4 h-4 text-ink-muted" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sohbetlerde ara" className="flex-1 bg-transparent outline-none text-sm font-semibold text-ink" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loaded && rows.length === 0 && (
            <div className="text-center px-6 py-12 text-ink-muted">
              <p className="text-4xl">🌱</p>
              <p className="font-bold mt-2">{query ? 'Sonuç yok' : 'Henüz sohbet yok'}</p>
              {!query && <button onClick={() => setDialog('direct')} className="btn-primary px-4 py-2 text-sm mt-4">Arkadaşını bul</button>}
            </div>
          )}
          {rows.map(({ chat, info }) => {
            const mine = chat.last_sender === meId;
            const readByAll = mine && info.others.every(o => Date.parse(o.last_read_at) >= Date.parse(chat.last_message_at));
            const sender = chat.is_group && chat.last_sender && !mine ? info.people.find(p => p.user_id === chat.last_sender)?.profiles.display_name.split(' ')[0] : null;
            return (
              <button key={chat.id} onClick={() => setActiveId(chat.id)}
                className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors', chat.id === activeId ? 'bg-glass/70' : 'hover:bg-glass/45')}>
                <ChatAvatar emoji={info.avatar} online={!!info.peer && online.has(info.peer.id)} />
                <div className="flex-1 min-w-0 border-b border-glass/50 pb-3 -mb-3">
                  <div className="flex items-baseline gap-2">
                    <p className="flex-1 font-black text-ink truncate">{info.name}</p>
                    <span className={cn('text-[11px] font-bold shrink-0', chat.unread ? 'text-[#1fa855]' : 'text-ink-muted')}>{chat.last_body ? listTime(chat.last_message_at) : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {mine && (readByAll ? <CheckCheck className="w-4 h-4 shrink-0 text-[#34b7f1]" /> : <Check className="w-4 h-4 shrink-0 text-ink-muted" />)}
                    <p className="flex-1 text-sm text-ink-soft truncate">
                      {sender && <span className="font-bold">{sender}: </span>}
                      {chat.last_body ?? (chat.is_group ? 'Grup kuruldu 🎉' : 'Merhaba de 👋')}
                    </p>
                    {chat.unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#25d366] text-white text-[11px] font-black flex items-center justify-center">{chat.unread}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Conversation */}
      <section className={cn('flex-1 min-w-0 flex flex-col', !active && 'hidden md:flex')}>
        {active && me ? (
          <ChatWindow key={active.id} chat={active} members={members.filter(m => m.chat_id === active.id)} me={me} online={online} onBack={() => setActiveId(null)} />
        ) : (
          <div className="flex-1 chat-wall flex flex-col items-center justify-center text-center p-8">
            <p className="text-6xl">💬</p>
            <h2 className="font-serif text-2xl font-bold text-ink mt-3">Sibilia Sohbet</h2>
            <p className="text-ink-soft mt-2 max-w-sm">Bir sohbet seç ya da arkadaşını kullanıcı adıyla bul. Kendi kullanıcı adın: <b>@{me?.username}</b></p>
          </div>
        )}
      </section>

      {dialog && me && <NewChatDialog mode={dialog} meId={meId} onClose={() => setDialog(null)} onOpened={opened} />}
    </div>
  );
};
