import { addDays, format, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const CORNER_KEYS = {
  books: 'careerflow_books',
  bookGoal: 'careerflow_book_goal',
  notes: 'careerflow_board',
  capsules: 'careerflow_capsules',
} as const;

const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

/* ---------------- Books ---------------- */

export type BookStatus = 'reading' | 'want' | 'done';

export interface Quote { id: string; text: string; page?: number }

export interface ShelfBook {
  id: string;
  title: string;
  author: string;
  pages: number;
  read: number;
  status: BookStatus;
  color: string;
  rating: number; // 0..5
  quotes: Quote[];
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export const BOOK_COLORS = ['#8a3b3b', '#2f5d7c', '#3f6b4a', '#7a5a2e', '#5b3f7a', '#b8763a', '#2d4a5a', '#a0485f', '#4a4a6a', '#6b7a3a'];

export const STATUS_LABEL: Record<BookStatus, string> = { reading: 'Okuyorum', want: 'Okuyacağım', done: 'Bitirdim' };

export const seedBooks = (): ShelfBook[] => {
  const now = new Date();
  const b = (title: string, author: string, pages: number, read: number, status: BookStatus, color: string, rating = 0, quotes: string[] = [], finishedDaysAgo?: number): ShelfBook => ({
    id: uuidv4(), title, author, pages, read, status, color, rating,
    quotes: quotes.map(text => ({ id: uuidv4(), text })),
    startedAt: status !== 'want' ? dayKey(subDays(now, 20)) : undefined,
    finishedAt: finishedDaysAgo !== undefined ? dayKey(subDays(now, finishedDaysAgo)) : undefined,
    createdAt: now.toISOString(),
  });
  return [
    b('Clean Code', 'Robert C. Martin', 464, 464, 'done', BOOK_COLORS[1], 5, ['Kod, yazıldığından çok daha fazla okunur.'], 40),
    b('The Pragmatic Programmer', 'Hunt & Thomas', 352, 190, 'reading', BOOK_COLORS[5], 0, ['Kendi yeteneklerinin sorumluluğunu al.']),
    b('Grokking Algorithms', 'Aditya Bhargava', 256, 256, 'done', BOOK_COLORS[0], 5, [], 12),
    b('Eloquent JavaScript', 'Marijn Haverbeke', 472, 80, 'reading', BOOK_COLORS[2]),
    b('You Don\'t Know JS', 'Kyle Simpson', 278, 0, 'want', BOOK_COLORS[6]),
    b('Refactoring', 'Martin Fowler', 448, 0, 'want', BOOK_COLORS[3]),
    b('Designing Data-Intensive Applications', 'Martin Kleppmann', 616, 0, 'want', BOOK_COLORS[4]),
  ];
};

/* ---------------- Cork board ---------------- */

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'lilac';

export interface BoardNote {
  id: string;
  text: string;
  color: NoteColor;
  /** Position in % of the board, so it survives resizes. */
  x: number;
  y: number;
  rotation: number;
  pin: 'pin' | 'tape';
  z: number;
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; edge: string }> = {
  yellow: { bg: '#fff1a8', edge: '#f2d65c' },
  pink: { bg: '#ffd3df', edge: '#f4a3ba' },
  blue: { bg: '#cfe8ff', edge: '#94c4f0' },
  green: { bg: '#d4f2c9', edge: '#9fd68c' },
  lilac: { bg: '#e6d9ff', edge: '#bfa6f2' },
};

export const PIN_COLORS = ['#d94848', '#3f7fd6', '#e0a923', '#3a9a6e', '#9b59b6'];

export const seedNotes = (): BoardNote[] => {
  const n = (text: string, color: NoteColor, x: number, y: number, rotation: number, pin: 'pin' | 'tape', z: number): BoardNote =>
    ({ id: uuidv4(), text, color, x, y, rotation, pin, z });
  return [
    n('Cuma: React projesi demo! 🚀', 'pink', 6, 8, -4, 'pin', 1),
    n('“Önce çalıştır, sonra güzelleştir.” ✨', 'yellow', 34, 14, 3, 'tape', 2),
    n('git pull yapmayı unutma 🌿\nSu iç 💧', 'green', 64, 6, -2, 'pin', 3),
    n('Yaz planı:\n• Staj başvuruları 💼\n• Portfolyo sitesi\n• Hackathon 🏆', 'blue', 12, 52, 2, 'tape', 4),
    n('Hafta sonu: kahvecide kod ☕💻', 'lilac', 52, 50, -3, 'pin', 5),
  ];
};

/* ---------------- Time capsule ---------------- */

export interface Capsule {
  id: string;
  title: string;
  body: string;
  emoji: string;
  createdAt: string; // yyyy-MM-dd
  openAt: string; // yyyy-MM-dd
  opened: boolean;
  color: string;
}

export const CAPSULE_COLORS = ['#c2577a', '#4f86c0', '#3a9a6e', '#d99a12', '#7a4a8a', '#b8502c'];
export const CAPSULE_EMOJIS = ['💌', '🌙', '🌱', '🎓', '🦋', '⭐', '🔮', '🌈'];

export const CAPSULE_PRESETS = [
  { label: '1 ay', days: 30 },
  { label: '3 ay', days: 91 },
  { label: '6 ay', days: 182 },
  { label: '1 yıl', days: 365 },
];

export const CAPSULE_PROMPTS = [
  'Şu an en çok neyi merak ediyorsun?',
  'Bu dönem seni en çok ne zorluyor? Geçti mi?',
  'Gelecekteki senden ne yapmasını bekliyorsun?',
  'Şu an hayatındaki en sevdiğin üç şey…',
  'Hangi sınav seni korkutuyor? Nasıl geçti sence?',
];

export const seedCapsules = (): Capsule[] => {
  const now = new Date();
  return [
    {
      id: uuidv4(), title: 'Dönem başındaki bana', emoji: '🌱', color: CAPSULE_COLORS[2], opened: false,
      createdAt: dayKey(subDays(now, 60)), openAt: dayKey(subDays(now, 1)),
      body: 'Selam! Bu mektubu yazarken dönem yeni başlamıştı ve biraz gergindim.\n\nUmarım her gün biraz çalışma sözünü tutmuşsundur. Tutamadıysan da sorun değil — yeniden başlamak her zaman mümkün.\n\nKendine iyi bak, su içmeyi unutma ve bir kahve ısmarla kendine. ☕\n\nSevgiyle, geçmişteki sen 💛',
    },
    {
      id: uuidv4(), title: 'Mezuniyet gününe', emoji: '🎓', color: CAPSULE_COLORS[0], opened: false,
      createdAt: dayKey(subDays(now, 10)), openAt: dayKey(addDays(now, 240)),
      body: 'Bunu okuyorsan başardın demektir! 🎉',
    },
  ];
};
