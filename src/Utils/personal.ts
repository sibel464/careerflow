import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const PERSONAL_KEYS = {
  timetable: 'careerflow_timetable',
  habits: 'careerflow_habits',
  decks: 'careerflow_decks',
  cards: 'careerflow_cards',
} as const;

import { FLASH_PACKS, FlashPack } from './flashPacks';

const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

/* ---------------- Timetable ---------------- */

/** 0 = Monday … 6 = Sunday. */
export interface ClassSlot {
  id: string;
  day: number;
  start: string; // "09:00"
  end: string;
  subjectId?: string;
  title: string;
  room: string;
  color: string;
}

export const WEEKDAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const WEEKDAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};
/** Today's index in the Monday-first week. */
export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

export const seedTimetable = (): ClassSlot[] => {
  const s = (day: number, start: string, end: string, subjectId: string, title: string, room: string, color: string): ClassSlot =>
    ({ id: uuidv4(), day, start, end, subjectId, title, room, color });
  return [
    s(0, '09:00', '10:50', 's-mat', 'Web Geliştirme', 'Lab-1', '#4f86c0'),
    s(0, '13:00', '14:50', 's-ing', 'Veritabanları', 'Lab-3', '#3a9a6e'),
    s(1, '10:00', '11:50', 's-fiz', 'React & TypeScript', 'Lab-2', '#b8502c'),
    s(1, '14:00', '15:50', 's-alg', 'Algoritmalar', 'D-301', '#7a4a8a'),
    s(2, '09:00', '10:50', 's-mat', 'Web Geliştirme', 'Lab-1', '#4f86c0'),
    s(2, '15:00', '16:30', 's-ing', 'Veritabanları', 'Lab-3', '#3a9a6e'),
    s(3, '11:00', '12:50', 's-alg', 'Algoritmalar', 'D-301', '#7a4a8a'),
    s(3, '14:00', '15:50', 's-fiz', 'React & TypeScript', 'Lab-2', '#b8502c'),
    s(4, '10:00', '11:50', 's-mat', 'Web Geliştirme', 'Lab-1', '#4f86c0'),
  ];
};

/** What's happening now and what's next today. */
export const classNow = (slots: ClassSlot[], now = new Date()) => {
  const day = todayIndex(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = slots.filter(s => s.day === day).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const current = today.find(s => toMinutes(s.start) <= minutes && minutes < toMinutes(s.end));
  const next = today.find(s => toMinutes(s.start) > minutes);
  return { today, current, next, minutes };
};

/* ---------------- Habits ---------------- */

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  /** Times per day that count as "done" (e.g. 8 glasses of water). */
  target: number;
  unit: string;
  log: Record<string, number>;
  createdAt: string;
}

export const HABIT_COLORS = ['#4f86c0', '#3a9a6e', '#d99a12', '#c2577a', '#7a4a8a', '#3f8f9a', '#c4553a'];
export const HABIT_EMOJIS = ['💧', '📖', '🏃', '🧘', '🍎', '😴', '🧹', '✍️', '🎸', '🌿', '💊', '📵'];

export const seedHabits = (): Habit[] => {
  const history = (rate: number, max: number) =>
    Object.fromEntries(Array.from({ length: 21 }, (_, i) => {
      const d = subDays(new Date(), i + 1);
      const v = Math.sin(i * 1.7 + max) > 1 - rate * 2 ? max : Math.floor(max * Math.abs(Math.sin(i * 3.1)));
      return [dayKey(d), v];
    }).filter(([, v]) => (v as number) > 0));
  const now = new Date().toISOString();
  return [
    { id: uuidv4(), name: 'Su iç', emoji: '💧', color: HABIT_COLORS[0], target: 8, unit: 'bardak', log: { ...history(0.7, 8), [dayKey(new Date())]: 3 }, createdAt: now },
    { id: uuidv4(), name: 'Kod yaz', emoji: '💻', color: HABIT_COLORS[4], target: 1, unit: '30 dk', log: history(0.6, 1), createdAt: now },
    { id: uuidv4(), name: 'Hareket et', emoji: '🏃', color: HABIT_COLORS[1], target: 1, unit: '30 dk', log: history(0.5, 1), createdAt: now },
    { id: uuidv4(), name: 'LeetCode sorusu', emoji: '🧩', color: HABIT_COLORS[3], target: 1, unit: 'soru', log: history(0.4, 1), createdAt: now },
  ];
};

export const habitDone = (h: Habit, date: string) => (h.log[date] ?? 0) >= h.target;

export const habitStreak = (h: Habit) => {
  let cursor = new Date();
  if (!habitDone(h, dayKey(cursor))) cursor = subDays(cursor, 1);
  let n = 0;
  while (habitDone(h, dayKey(cursor))) { n++; cursor = subDays(cursor, 1); }
  return n;
};

/* ---------------- Flashcards (Leitner boxes) ---------------- */

export interface Deck { id: string; name: string; emoji: string; color: string; subjectId?: string; createdAt: string }
export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  /** Leitner box 1–5: the higher, the longer until it comes back. */
  box: number;
  due: string; // yyyy-MM-dd
  reviews: number;
  correct: number;
}

/** Days until a card in each box is due again. */
export const BOX_INTERVAL = [0, 1, 2, 4, 8, 16];

export type Grade = 'again' | 'hard' | 'good';

/** Moves a card through the Leitner boxes after an answer. */
export const gradeCard = (card: Card, grade: Grade, today = new Date()): Card => {
  const box = grade === 'good' ? Math.min(card.box + 1, 5) : grade === 'hard' ? card.box : 1;
  const days = grade === 'again' ? 0 : BOX_INTERVAL[box];
  return {
    ...card,
    box,
    due: dayKey(addDays(today, days)),
    reviews: card.reviews + 1,
    correct: card.correct + (grade === 'good' ? 1 : 0),
  };
};

export const isDue = (card: Card, today = new Date()) => differenceInCalendarDays(parseISO(card.due), today) <= 0;

/** A deck and its cards built from one of the ready-made packs. */
export const packToDeck = (pack: FlashPack): Deck => ({
  id: pack.id, name: pack.name, emoji: pack.emoji, color: pack.color, subjectId: pack.subjectId, createdAt: new Date().toISOString(),
});
export const packCards = (pack: FlashPack, skipFronts: Set<string> = new Set()): Card[] => {
  const today = dayKey(new Date());
  return pack.cards
    .filter(([front]) => !skipFronts.has(front))
    .map(([front, back]) => ({ id: uuidv4(), deckId: pack.id, front, back, box: 1, due: today, reviews: 0, correct: 0 }));
};

export const seedDecks = (): Deck[] => FLASH_PACKS.map(packToDeck);
export const seedCards = (): Card[] => FLASH_PACKS.flatMap(p => packCards(p));
