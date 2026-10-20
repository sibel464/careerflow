import { differenceInCalendarDays, format, isToday, isYesterday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface Profile { id: string; username: string; display_name: string; avatar: string }

export interface ChatRow {
  id: string;
  is_group: boolean;
  title: string | null;
  last_message_at: string;
  last_body: string | null;
  last_kind: string | null;
  last_sender: string | null;
  unread: number;
}

export interface Member { chat_id: string; user_id: string; last_read_at: string; profiles: Profile }

/** A shared progress card: a goal stop, today's focus, a streak… */
export interface ProgressMeta { emoji: string; title: string; value: string; detail?: string }

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  kind: 'text' | 'progress';
  meta: ProgressMeta | null;
  created_at: string;
  /** Still on its way to the server. */
  pending?: boolean;
}

export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

export const PROFILE_FIELDS = 'id, username, display_name, avatar';

const NAME_COLORS = ['#c05c3e', '#2c7a5e', '#4c58a8', '#a0487a', '#b07d12', '#2f7f99', '#7a5a2c', '#6a4cb0'];

/** A stable color per person for group-chat names. */
export const nameColor = (id: string) => NAME_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % NAME_COLORS.length];

/** Time shown in the chat list: 14:05 · Dün · Salı · 03.10.2026 */
export const listTime = (iso: string) => {
  const d = parseISO(iso);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Dün';
  if (differenceInCalendarDays(new Date(), d) < 7) return format(d, 'EEEE', { locale: tr });
  return format(d, 'dd.MM.yyyy');
};

/** Day separator inside a conversation. */
export const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  if (isToday(d)) return 'Bugün';
  if (isYesterday(d)) return 'Dün';
  return format(d, 'd MMMM yyyy, EEEE', { locale: tr });
};

export const clock = (iso: string) => format(parseISO(iso), 'HH:mm');

/** Name, avatar and the other people of a chat, as seen by `meId`. */
export const chatInfo = (chat: Pick<ChatRow, 'id' | 'is_group' | 'title'>, members: Member[], meId: string) => {
  const people = members.filter(m => m.chat_id === chat.id);
  const others = people.filter(m => m.user_id !== meId);
  if (chat.is_group) return { name: chat.title || 'Grup', avatar: '👥', others, people, peer: null };
  const peer = others[0]?.profiles ?? null;
  return { name: peer?.display_name ?? 'Bilinmeyen', avatar: peer?.avatar ?? '🙂', others, people, peer };
};
