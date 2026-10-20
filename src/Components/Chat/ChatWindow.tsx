import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, Clock, SendHorizontal, Smile, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../Utils/supabase';
import { ChatRow, Member, Message, Profile, ProgressMeta, chatInfo, clock, dayLabel, nameColor } from '../../Utils/chat';
import { ChatAvatar } from './Messenger';
import { ProgressPicker } from './ProgressPicker';
import { cn } from '../../Utils/classNames';

const EMOJIS = ['😀', '😂', '🥹', '😍', '🥰', '😎', '🤔', '😴', '😭', '😤', '👍', '👏', '🙏', '💪', '🔥', '✨', '🎉', '❤️', '💛', '📚', '✍️', '☕', '🍅', '🎯'];

const ProgressCard: React.FC<{ meta: ProgressMeta; mine: boolean }> = ({ meta, mine }) => (
  <div className={cn('paper rounded-lg px-4 py-3 mb-1 min-w-[200px] shadow-sm rotate-[-0.6deg]', mine && 'text-[#3b2f25]')}>
    <p className="text-[10px] font-black tracking-[0.2em] opacity-60">📈 İLERLEME</p>
    <div className="flex items-center gap-3 mt-1">
      <span className="text-4xl">{meta.emoji}</span>
      <div className="min-w-0">
        <p className="font-bold text-sm leading-tight">{meta.title}</p>
        <p className="font-hand text-3xl leading-none text-[#b8322a]">{meta.value}</p>
      </div>
    </div>
    {meta.detail && <p className="text-xs font-semibold opacity-70 mt-1">{meta.detail}</p>}
  </div>
);

interface Props { chat: ChatRow; members: Member[]; me: Profile; online: Set<string>; onBack: () => void }

export const ChatWindow: React.FC<Props> = ({ chat, members, me, online, onBack }) => {
  const sb = supabase!;
  const info = chatInfo(chat, members, me.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState<Record<string, string>>({});
  const [panel, setPanel] = useState<'emoji' | 'progress' | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const typingChannel = useRef<ReturnType<typeof sb.channel> | null>(null);
  const lastTypingSent = useRef(0);
  const stickToBottom = useRef(true);

  const add = (msg: Message) => setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));

  // Load history, then follow new messages live.
  useEffect(() => {
    sb.from('messages').select('*').eq('chat_id', chat.id).order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setMessages(((data ?? []) as Message[]).reverse()); setLoading(false); });
    const channel = sb.channel(`room:${chat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` }, payload => add(payload.new as Message))
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [sb, chat.id]);

  // "yazıyor…"
  useEffect(() => {
    const timers: Record<string, number> = {};
    const channel = sb.channel(`typing:${chat.id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { id, name } = payload as { id: string; name: string };
        if (id === me.id) return;
        setTyping(t => ({ ...t, [id]: name }));
        clearTimeout(timers[id]);
        timers[id] = window.setTimeout(() => setTyping(t => { const next = { ...t }; delete next[id]; return next; }), 3000);
      })
      .subscribe();
    typingChannel.current = channel;
    return () => { Object.values(timers).forEach(clearTimeout); sb.removeChannel(channel); typingChannel.current = null; };
  }, [sb, chat.id, me.id]);

  // Opening the chat (and every new message while it's open) marks it read → blue ticks for the sender.
  useEffect(() => {
    if (loading) return;
    const markRead = () => { if (document.visibilityState === 'visible') sb.rpc('mark_read', { c: chat.id }); };
    markRead();
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [sb, chat.id, loading, messages.length]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const send = async (body: string, meta: ProgressMeta | null = null) => {
    const tempId = `tmp-${Date.now()}`;
    stickToBottom.current = true;
    add({ id: tempId, chat_id: chat.id, sender_id: me.id, body, kind: meta ? 'progress' : 'text', meta, created_at: new Date().toISOString(), pending: true });
    const { data, error } = await sb.from('messages').insert({ chat_id: chat.id, body, kind: meta ? 'progress' : 'text', meta }).select().single();
    setMessages(prev => {
      const rest = prev.filter(m => m.id !== tempId);
      if (error || !data) return rest;
      return rest.some(m => m.id === data.id) ? rest : [...rest, data as Message];
    });
    if (error) toast.error('Mesaj gönderilemedi, bağlantını kontrol et.');
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    setPanel(null);
    send(body);
    input.current?.focus();
  };

  const onType = (value: string) => {
    setText(value.slice(0, 4000));
    if (Date.now() - lastTypingSent.current > 2000) {
      lastTypingSent.current = Date.now();
      typingChannel.current?.send({ type: 'broadcast', event: 'typing', payload: { id: me.id, name: me.display_name.split(' ')[0] } });
    }
  };

  const typingNames = Object.values(typing);
  const status = typingNames.length
    ? (chat.is_group ? `${typingNames.join(', ')} yazıyor…` : 'yazıyor…')
    : chat.is_group
      ? info.people.map(p => (p.user_id === me.id ? 'Sen' : p.profiles.display_name.split(' ')[0])).join(', ')
      : info.peer && online.has(info.peer.id) ? 'çevrimiçi' : info.peer ? `@${info.peer.username}` : '';

  const isRead = (m: Message) => info.others.length > 0 && info.others.every(o => Date.parse(o.last_read_at) >= Date.parse(m.created_at));

  return (
    <>
      <header className="flex items-center gap-3 px-3 sm:px-4 h-16 shrink-0 border-b border-glass/60 bg-glass/40">
        <button onClick={onBack} className="md:hidden p-2 -ml-1 rounded-full text-ink-soft hover:bg-glass/70" aria-label="Geri"><ArrowLeft className="w-5 h-5" /></button>
        <ChatAvatar emoji={info.avatar} size="sm" online={!!info.peer && online.has(info.peer.id)} />
        <div className="min-w-0">
          <p className="font-black text-ink truncate leading-tight">{info.name}</p>
          <p className={cn('text-xs font-semibold truncate', typingNames.length || status === 'çevrimiçi' ? 'text-[#1fa855]' : 'text-ink-muted')}>{status}</p>
        </div>
      </header>

      <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto custom-scrollbar chat-wall px-3 sm:px-[4%] py-4 space-y-1">
        {loading && <p className="text-center text-3xl animate-bounce py-10">💬</p>}
        {!loading && messages.length === 0 && (
          <div className="mx-auto mt-8 max-w-xs text-center rounded-xl bg-[#fff6d6] text-[#5c4a1f] text-xs font-semibold px-4 py-3 shadow-sm">
            🔒 Burası {info.name} ile sohbetin. İlk mesajı sen gönder, ya da bugünkü ilerlemeni paylaş 📈
          </div>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const mine = m.sender_id === me.id;
          const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
          const firstOfRun = newDay || prev.sender_id !== m.sender_id;
          const sender = chat.is_group && !mine && firstOfRun ? info.people.find(p => p.user_id === m.sender_id)?.profiles : null;
          return (
            <React.Fragment key={m.id}>
              {newDay && (
                <div className="flex justify-center py-2 sticky top-0 z-10">
                  <span className="px-3 py-1 rounded-lg bg-glass/90 text-ink-soft text-[11px] font-black shadow-sm">{dayLabel(m.created_at)}</span>
                </div>
              )}
              <div className={cn('flex animate-pop', mine ? 'justify-end' : 'justify-start', firstOfRun && 'pt-1.5')}>
                <div className={cn('chat-bubble relative max-w-[85%] sm:max-w-[70%] xl:max-w-[60%] rounded-xl px-2.5 pt-1.5 pb-1 shadow-[0_1px_1px_rgba(0,0,0,0.12)]',
                  mine ? 'bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef]' : 'bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef]',
                  firstOfRun && (mine ? 'rounded-tr-none chat-tail-right' : 'rounded-tl-none chat-tail-left'))}>
                  {sender && <p className="text-xs font-black mb-0.5" style={{ color: nameColor(sender.id) }}>{sender.avatar} {sender.display_name}</p>}
                  {m.kind === 'progress' && m.meta ? <ProgressCard meta={m.meta} mine={mine} /> : (
                    <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words pr-14">{m.body}</p>
                  )}
                  <span className={cn('flex items-center gap-1 text-[10.5px] opacity-60 float-right -mt-3.5', m.kind === 'progress' && 'mt-0')}>
                    {clock(m.created_at)}
                    {mine && (m.pending ? <Clock className="w-3 h-3" /> : isRead(m) ? <CheckCheck className="w-4 h-4 text-[#34b7f1] opacity-100" /> : <Check className="w-3.5 h-3.5" />)}
                  </span>
                  <span className="block clear-both" />
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {typingNames.length > 0 && (
          <div className="flex pt-1.5">
            <div className="rounded-xl rounded-tl-none bg-white dark:bg-[#202c33] px-4 py-3 shadow-sm flex gap-1" aria-label="yazıyor">
              {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
      </div>

      {panel === 'emoji' && (
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 p-2 border-t border-glass/60 bg-glass/50">
          {EMOJIS.map(em => <button key={em} type="button" onClick={() => { onType(text + em); input.current?.focus(); }} className="text-2xl rounded-lg hover:bg-glass/80 py-1">{em}</button>)}
        </div>
      )}
      {panel === 'progress' && <ProgressPicker onPick={(meta, body) => { setPanel(null); send(body, meta); }} />}

      <form onSubmit={submit} className="flex items-end gap-2 px-2 sm:px-3 py-2 border-t border-glass/60 bg-glass/40">
        <button type="button" onClick={() => setPanel(p => (p === 'emoji' ? null : 'emoji'))} className={cn('p-2.5 rounded-full text-ink-soft hover:bg-glass/70', panel === 'emoji' && 'text-moss')} aria-label="Emoji"><Smile className="w-6 h-6" /></button>
        <button type="button" onClick={() => setPanel(p => (p === 'progress' ? null : 'progress'))} className={cn('p-2.5 rounded-full text-ink-soft hover:bg-glass/70', panel === 'progress' && 'text-moss')} aria-label="İlerleme paylaş" title="İlerlemeni paylaş"><TrendingUp className="w-6 h-6" /></button>
        <textarea ref={input} rows={1} value={text} onChange={e => onType(e.target.value)} placeholder="Mesaj yaz"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl glass-input text-[15px] text-ink field-sizing-content" />
        <button type="submit" disabled={!text.trim()} className="w-11 h-11 shrink-0 rounded-full bg-moss text-white flex items-center justify-center shadow-md transition-transform active:scale-90 disabled:opacity-40" aria-label="Gönder">
          <SendHorizontal className="w-5 h-5" />
        </button>
      </form>
    </>
  );
};
