import { addDays, format, isSameDay, nextDay, parseISO, startOfDay, subDays, Day } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const STUDY_KEYS = {
  subjects: 'careerflow_subjects',
  exams: 'careerflow_exams',
  tasks: 'careerflow_tasks',
  log: 'careerflow_study_log',
  rewards: 'careerflow_rewards',
  redemptions: 'careerflow_redemptions',
  settings: 'careerflow_study_settings',
} as const;

export interface Topic { id: string; title: string; done: boolean }
export interface Subject { id: string; name: string; emoji: string; color: string; topics: Topic[] }
export interface Exam { id: string; subjectId: string; title: string; date: string }
export interface StudyTask {
  id: string;
  title: string;
  done: boolean;
  due?: string; // yyyy-MM-dd
  priority: 0 | 1 | 2;
  subjectId?: string;
  createdAt: string;
  completedAt?: string;
}
export interface StudyLog { id: string; date: string; minutes: number; subjectId?: string; note?: string }
export interface Reward { id: string; title: string; emoji: string; cost: number }
export interface Redemption { id: string; rewardId: string; title: string; emoji: string; cost: number; date: string }
export interface StudySettings { dailyGoal: number; why: string }

/** Subject colors, chosen to stay distinguishable from each other in both themes. */
export const SUBJECT_COLORS = ['#4f86c0', '#b8502c', '#3a9a6e', '#7a4a8a', '#d99a12', '#c2577a', '#3f8f9a', '#6b6f2a'];
export const SUBJECT_EMOJIS = ['💻', '🌐', '⚛️', '🗄️', '🧠', '🐍', '☕', '🐳', '🔐', '📱', '🤖', '🧪', '📊', '🎨'];

export const DEFAULT_SETTINGS: StudySettings = {
  dailyGoal: 120,
  why: 'Hayalimdeki işe hazır olmak ve kendimle gurur duymak için. 🌟',
};

const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

export const seedSubjects = (): Subject[] => [
  { id: 's-mat', name: 'Web Geliştirme', emoji: '🌐', color: SUBJECT_COLORS[0], topics: [
    { id: uuidv4(), title: 'HTML & semantik etiketler', done: true },
    { id: uuidv4(), title: 'CSS Flexbox & Grid', done: true },
    { id: uuidv4(), title: 'JavaScript DOM & olaylar', done: false },
    { id: uuidv4(), title: 'Responsive tasarım', done: false },
  ] },
  { id: 's-fiz', name: 'React & TypeScript', emoji: '⚛️', color: SUBJECT_COLORS[1], topics: [
    { id: uuidv4(), title: 'Bileşenler ve props', done: true },
    { id: uuidv4(), title: 'Hook\'lar (useState, useEffect)', done: false },
    { id: uuidv4(), title: 'TypeScript tipleri & generics', done: false },
  ] },
  { id: 's-ing', name: 'Veritabanları', emoji: '🗄️', color: SUBJECT_COLORS[2], topics: [
    { id: uuidv4(), title: 'SQL SELECT & JOIN', done: true },
    { id: uuidv4(), title: 'Normalizasyon', done: false },
    { id: uuidv4(), title: 'İndeksler & performans', done: false },
  ] },
  { id: 's-alg', name: 'Algoritmalar', emoji: '🧠', color: SUBJECT_COLORS[3], topics: [
    { id: uuidv4(), title: 'Sıralama algoritmaları', done: true },
    { id: uuidv4(), title: 'Graf gezinme (BFS/DFS)', done: false },
    { id: uuidv4(), title: 'Dinamik programlama', done: false },
  ] },
];

export const seedExams = (): Exam[] => {
  const at = (days: number, hour: number) => {
    const d = addDays(startOfDay(new Date()), days);
    d.setHours(hour);
    return d.toISOString();
  };
  return [
    { id: uuidv4(), subjectId: 's-mat', title: 'Frontend Proje Sunumu', date: at(5, 10) },
    { id: uuidv4(), subjectId: 's-alg', title: 'Algoritma Proje Teslimi', date: at(9, 23) },
    { id: uuidv4(), subjectId: 's-ing', title: 'SQL Quiz', date: at(14, 13) },
  ];
};

export const seedTasks = (): StudyTask[] => {
  const now = new Date();
  return [
    { id: uuidv4(), title: 'Responsive navbar\'ı bitir (mobil menü)', done: false, due: dayKey(now), priority: 2, subjectId: 's-mat', createdAt: now.toISOString() },
    { id: uuidv4(), title: 'useEffect ile todo uygulaması yaz', done: false, due: dayKey(addDays(now, 1)), priority: 1, subjectId: 's-fiz', createdAt: now.toISOString() },
    { id: uuidv4(), title: 'SQL JOIN alıştırmaları (15 soru)', done: false, due: dayKey(now), priority: 0, subjectId: 's-ing', createdAt: now.toISOString() },
    { id: uuidv4(), title: 'LeetCode: 3 dinamik programlama sorusu', done: false, due: dayKey(addDays(now, 3)), priority: 0, subjectId: 's-alg', createdAt: now.toISOString() },
    { id: uuidv4(), title: 'GitHub\'a portfolyo reposunu yükle', done: true, due: dayKey(subDays(now, 1)), priority: 1, subjectId: 's-mat', createdAt: subDays(now, 2).toISOString(), completedAt: subDays(now, 1).toISOString() },
  ];
};

/** A believable couple of weeks of study history for the demo. */
export const seedLog = (): StudyLog[] => {
  const pattern = [
    [['s-mat', 50], ['s-ing', 25]], [['s-alg', 75]], [], [['s-fiz', 50], ['s-mat', 25]], [['s-mat', 100]],
    [['s-ing', 25], ['s-alg', 50]], [['s-fiz', 25]], [['s-mat', 50], ['s-alg', 50]], [['s-ing', 50]], [],
    [['s-alg', 25], ['s-fiz', 50]], [['s-mat', 75], ['s-ing', 25]], [['s-alg', 50]],
  ] as [string, number][][];
  return pattern.flatMap((sessions, i) => {
    const day = subDays(new Date(), pattern.length - i);
    day.setHours(10 + i % 6, 0, 0, 0);
    return sessions.map(([subjectId, minutes], j) => ({
      id: uuidv4(), subjectId, minutes, date: new Date(day.getTime() + j * 3600000).toISOString(),
    }));
  });
};

export const seedRewards = (): Reward[] => [
  { id: uuidv4(), title: 'Kahve molası', emoji: '☕', cost: 10 },
  { id: uuidv4(), title: 'Bir tatlı ısmarla kendine', emoji: '🍰', cost: 15 },
  { id: uuidv4(), title: 'Bir bölüm dizi', emoji: '🎬', cost: 20 },
  { id: uuidv4(), title: '30 dakika oyun', emoji: '🎮', cost: 25 },
  { id: uuidv4(), title: 'Arkadaşlarla buluşma', emoji: '🍕', cost: 60 },
  { id: uuidv4(), title: 'Kendine küçük bir hediye', emoji: '🎁', cost: 120 },
];

/* ---------- Derived numbers ---------- */

export const minutesOn = (log: StudyLog[], day: Date) =>
  log.filter(l => isSameDay(parseISO(l.date), day)).reduce((s, l) => s + l.minutes, 0);

export const studyStreak = (log: StudyLog[]) => {
  const days = new Set(log.map(l => dayKey(parseISO(l.date))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/** 🪙 Coins: 1 per 5 focused minutes, 2 per finished task, 3 per finished topic — minus what was spent. */
export const coinBalance = (log: StudyLog[], tasks: StudyTask[], subjects: Subject[], redemptions: Redemption[]) => {
  const earned =
    Math.floor(log.reduce((s, l) => s + l.minutes, 0) / 5) +
    tasks.filter(t => t.done).length * 2 +
    subjects.flatMap(s => s.topics).filter(t => t.done).length * 3;
  const spent = redemptions.reduce((s, r) => s + r.cost, 0);
  return { earned, spent, balance: earned - spent };
};

export const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} dk`;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
};

/* ---------- Natural-language quick add ---------- */

const WEEKDAYS: Record<string, Day> = {
  pazar: 0, pazartesi: 1, salı: 2, sali: 2, çarşamba: 3, carsamba: 3, perşembe: 4, persembe: 4, cuma: 5, cumartesi: 6,
};

export interface ParsedTask { title: string; due?: string; priority: 0 | 1 | 2; subjectId?: string; tags: string[] }

/**
 * "API entegrasyonu yarın !! #react" → title "API entegrasyonu", due tomorrow, high priority, subject React & TypeScript.
 * Understands: bugün, yarın, öbür gün, weekday names, "3 gün sonra", ! / !!, #ders.
 */
export function parseQuickTask(input: string, subjects: Subject[]): ParsedTask {
  let text = ` ${input} `;
  const today = startOfDay(new Date());
  let due: Date | undefined;
  let priority: 0 | 1 | 2 = 0;
  let subjectId: string | undefined;
  const tags: string[] = [];
  const lower = (s: string) => s.toLocaleLowerCase('tr-TR');

  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = text.match(re);
    if (m) {
      fn(m);
      text = text.replace(m[0], ' ');
    }
  };

  take(/\s(!!|!)(?=\s)/u, m => { priority = m[1] === '!!' ? 2 : 1; });
  take(/\s#(\S+)/u, m => {
    const tag = lower(m[1]);
    const subject = subjects.find(s => lower(s.name).startsWith(tag) || tag.startsWith(lower(s.name).slice(0, 3)));
    if (subject) { subjectId = subject.id; tags.push(subject.name); }
  });
  take(/\s(\d+)\s*gün\s*sonra(?=\s)/iu, m => { due = addDays(today, Number(m[1])); });
  take(/\s(bugün|bu\s*gün)(?=\s)/iu, () => { due = today; });
  take(/\s(öbür\s*gün|yarından\s*sonra)(?=\s)/iu, () => { due = addDays(today, 2); });
  take(/\s(yarın)(?=\s)/iu, () => { due = addDays(today, 1); });
  if (!due) {
    take(/\s(pazartesi|salı|sali|çarşamba|carsamba|perşembe|persembe|cumartesi|cuma|pazar)(?=\s)/iu, m => {
      due = nextDay(today, WEEKDAYS[lower(m[1])]);
    });
  }

  return {
    title: text.replace(/\s+/g, ' ').trim(),
    due: due ? dayKey(due) : undefined,
    priority,
    subjectId,
    tags,
  };
}
