import { format } from 'date-fns';
import { subDays } from 'date-fns';
import { studyStreak } from './study';
import type { StudyLog, StudyTask } from './study';
import type { ShelfBook } from './corner';

export const PET_KEY = 'careerflow_pet';

export type Species = 'cat' | 'dog' | 'bunny' | 'fox';

export interface PetState {
  enabled: boolean;
  name: string;
  species: Species;
  color: string;
  /** 0–100, both drift down over time. */
  hunger: number;
  happiness: number;
  /** When hunger/happiness were last written (ms). */
  updatedAt: number;
  /** Growth counts focus minutes from this day on. */
  adoptedAt: string;
  /** Traits it has already announced, so each new one gets a little celebration. */
  seenTraits?: TraitId[];
}

export const SPECIES: Record<Species, { label: string; emoji: string; sound: string }> = {
  cat: { label: 'Kedi', emoji: '🐱', sound: 'Miyav!' },
  dog: { label: 'Köpek', emoji: '🐶', sound: 'Hav hav!' },
  bunny: { label: 'Tavşan', emoji: '🐰', sound: 'Burun kıpır kıpır…' },
  fox: { label: 'Tilki', emoji: '🦊', sound: 'Yip yip!' },
};

/** Box size (base width, height ratio) of the animal drawings. */
export const artBox = () => ({ width: 120, ratio: 120 / 140 });

export const PET_COLORS = [
  { name: 'Tarçın', value: '#e39a55' },
  { name: 'Pamuk', value: '#f4efe7' },
  { name: 'Kömür', value: '#4f4846' },
  { name: 'Bisküvi', value: '#cdb193' },
  { name: 'Çikolata', value: '#8a5a3b' },
  { name: 'Duman', value: '#9aa0a8' },
];

export const newPet = (): PetState => ({
  enabled: true, name: 'Pamuk', species: 'cat', color: PET_COLORS[0].value,
  hunger: 80, happiness: 85, updatedAt: Date.now(), adoptedAt: format(new Date(), 'yyyy-MM-dd'),
});

export const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Needs ease down slowly — about a day and a half from full to empty. */
export const decayed = (p: PetState, now = Date.now()): PetState => {
  const hours = Math.max(0, (now - p.updatedAt) / 3_600_000);
  return { ...p, hunger: clamp(p.hunger - hours * 2.5), happiness: clamp(p.happiness - hours * 2), updatedAt: now };
};

/** Your focus time is what makes your pet grow up. */
export const STAGES = [
  { label: 'Yavru', minutes: 0, scale: 0.95 },
  { label: 'Genç', minutes: 10 * 60, scale: 1.1 },
  { label: 'Yetişkin', minutes: 40 * 60, scale: 1.25 },
];

export const growth = (p: PetState, log: StudyLog[]) => {
  const minutes = log.filter(l => l.date.slice(0, 10) >= p.adoptedAt).reduce((s, l) => s + l.minutes, 0);
  const index = STAGES.reduce((at, s, i) => (minutes >= s.minutes ? i : at), 0);
  const next = STAGES[index + 1];
  return { minutes, stage: STAGES[index], next, toNext: next ? (minutes - STAGES[index].minutes) / (next.minutes - STAGES[index].minutes) : 1 };
};

/** Something to say, depending on how it's doing. */
export const chatter = (p: PetState) => {
  if (p.hunger < 25) return ['Karnım guruldadı… 🐟', 'Mama zamanı geldi mi? 🥣'];
  if (p.happiness < 30) return ['Benimle oynar mısın? 🧶', 'Biraz sevilmeye ihtiyacım var 🥺'];
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 6) return ['Uykum geldi… sen de yatsana 🌙', 'Esneeek 😴'];
  return [SPECIES[p.species].sound, 'Bugün harikasın! 💛', 'Su içtin mi? 💧', 'Hadi bir pomodoro, ben yanındayım 🍅', 'Seni seviyorum 🤍', 'Şuraya bir göz atayım… 👀'];
};

/* ---------- Personality: the pet slowly takes after your habits ---------- */

export type TraitId = 'night' | 'early' | 'bookworm' | 'tasks' | 'streak' | 'marathon';

export interface Trait {
  id: TraitId;
  emoji: string;
  title: string;
  /** What it wears or how it changes. */
  look: string;
  /** How to earn it. */
  hint: string;
  active: boolean;
  /** 0–1, how close you are. */
  progress: number;
}

const share = (log: StudyLog[], from: number, to: number) => {
  const total = log.reduce((s, l) => s + l.minutes, 0);
  const inside = log.filter(l => {
    const h = new Date(l.date).getHours();
    return from < to ? h >= from && h < to : h >= from || h < to;
  }).reduce((s, l) => s + l.minutes, 0);
  return { total, ratio: total ? inside / total : 0 };
};

/** Looks at the last two weeks (two months for books) and decides who your pet is becoming. */
export const petTraits = (log: StudyLog[], tasks: StudyTask[], books: ShelfBook[]): Trait[] => {
  const since = subDays(new Date(), 14).toISOString();
  const recent = log.filter(l => l.date >= since);
  const night = share(recent, 22, 5);
  const early = share(recent, 5, 10);
  const enough = (x: { total: number }) => x.total >= 60;
  const booksDone = books.filter(b => b.status === 'done' && b.finishedAt && b.finishedAt >= subDays(new Date(), 60).toISOString().slice(0, 10)).length;
  const tasksDone = tasks.filter(t => t.done && t.completedAt && t.completedAt >= since).length;
  const streak = studyStreak(log);
  const perDay = new Map<string, number>();
  recent.forEach(l => perDay.set(l.date.slice(0, 10), (perDay.get(l.date.slice(0, 10)) ?? 0) + l.minutes));
  const bestDay = Math.max(0, ...perDay.values());
  const nightActive = enough(night) && night.ratio >= 0.4;

  return [
    { id: 'night', emoji: '🌙', title: 'Gece kuşu', look: 'Uyku şapkası takar, gözlerinin altı hafif morarır',
      hint: 'Son 2 haftada çalışmanın çoğunu 22:00 ile 05:00 arasında yap', active: nightActive, progress: Math.min(night.ratio / 0.4, 1) },
    { id: 'early', emoji: '☀️', title: 'Sabahçı', look: 'Güneş gözlüğünü başına takar',
      hint: 'Son 2 haftada çalışmanın çoğunu 05:00 ile 10:00 arasında yap', active: !nightActive && enough(early) && early.ratio >= 0.4, progress: Math.min(early.ratio / 0.4, 1) },
    { id: 'bookworm', emoji: '🤓', title: 'Kitap kurdu', look: 'Yuvarlak okuma gözlüğü takar',
      hint: 'Son 2 ayda Kitaplığım’da 2 kitap bitir', active: booksDone >= 2, progress: Math.min(booksDone / 2, 1) },
    { id: 'tasks', emoji: '⭐', title: 'Görev avcısı', look: 'Yıldızlı bir tasma kazanır',
      hint: 'Son 2 haftada 10 görev tamamla', active: tasksDone >= 10, progress: Math.min(tasksDone / 10, 1) },
    { id: 'streak', emoji: '🌸', title: 'İstikrar ustası', look: 'Başına çiçek taç takar',
      hint: '7 gün üst üste çalış', active: streak >= 7, progress: Math.min(streak / 7, 1) },
    { id: 'marathon', emoji: '💪', title: 'Maratoncu', look: 'Patisine ter bandı takar',
      hint: 'Son 2 haftada bir günde 4 saat odaklan', active: bestDay >= 240, progress: Math.min(bestDay / 240, 1) },
  ];
};
