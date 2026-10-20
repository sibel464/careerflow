import { format, startOfYear, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { StudyLog } from './study';
import type { ShelfBook } from './corner';

export const GOALS_KEY = 'careerflow_goals';

/** steps: you tick milestones yourself · focus: hours from Pomodoro · books: books finished on your shelf. */
export type GoalKind = 'steps' | 'focus' | 'books';

export interface Milestone { id: string; title: string; done: boolean; doneAt?: string }

export interface Goal {
  id: string;
  title: string;
  emoji: string;
  kind: GoalKind;
  /** Hours (focus) or count (books). */
  target: number;
  /** Auto goals count from this day on. */
  since: string;
  deadline?: string;
  milestones: Milestone[];
  createdAt: string;
}

export const GOAL_EMOJIS = ['🎓', '🏆', '📚', '🧠', '✈️', '💪', '🎯', '🌍', '💻', '🎨', '🗣️', '⭐'];

export const KIND_INFO: Record<GoalKind, { label: string; hint: string; unit: string }> = {
  steps: { label: 'Adım adım', hint: 'Kilometre taşlarını sen işaretlersin', unit: '' },
  focus: { label: 'Odak saati', hint: 'Pomodoro seanslarından otomatik dolar', unit: 'saat' },
  books: { label: 'Kitap', hint: 'Kitaplığında bitirdiğin kitaplardan dolar', unit: 'kitap' },
};

const m = (title: string, done = false): Milestone => ({ id: uuidv4(), title, done, doneAt: done ? format(subDays(new Date(), 5), 'yyyy-MM-dd') : undefined });

/** The semester road: midterms, breaks and finals as stops on the map. */
const semesterGoal = (): Goal => ({
  id: uuidv4(), title: 'Dönem yolculuğum', emoji: '🎓', kind: 'steps', target: 0, since: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
  milestones: [m('Dönem başladı 🎒', true), m('Ders programını oturt', true), m('Vizelere hazırlan', true), m('Vizeler 📝'), m('Ara tatil 🏖️'), m('Proje teslimi'), m('Finaller 📚'), m('Yaz tatili ☀️')],
  createdAt: new Date().toISOString(),
});

export const seedGoals = (): Goal[] => [
  semesterGoal(),
  {
    id: uuidv4(), title: '50 saat derin odak', emoji: '🧠', kind: 'focus', target: 50, since: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    milestones: [], createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(), title: 'Bu yıl 12 kitap', emoji: '📚', kind: 'books', target: 12, since: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    milestones: [], createdAt: new Date().toISOString(),
  },
];

/** Swaps the old GPA sample goal for the semester road, keeping its place on the map. */
export const migrateGoals = (goals: Goal[]) =>
  goals.some(g => g.title === 'Dönemi 3.5 ortalamayla bitir')
    ? goals.map(g => (g.title === 'Dönemi 3.5 ortalamayla bitir' ? { ...semesterGoal(), id: g.id } : g))
    : goals;

/** Current value and the milestone list (auto goals get four evenly spaced stops). */
export const goalProgress = (g: Goal, log: StudyLog[], books: ShelfBook[]) => {
  if (g.kind === 'steps') {
    const done = g.milestones.filter(x => x.done).length;
    const total = g.milestones.length;
    return { value: done, total, fraction: total ? done / total : 0, stops: g.milestones };
  }
  const value = g.kind === 'focus'
    ? log.filter(l => l.date.slice(0, 10) >= g.since).reduce((s, l) => s + l.minutes, 0) / 60
    : books.filter(b => b.status === 'done' && b.finishedAt && b.finishedAt >= g.since).length;
  const unit = KIND_INFO[g.kind].unit;
  const stops: Milestone[] = [0.25, 0.5, 0.75, 1].map(f => {
    const need = Math.round(g.target * f);
    return { id: `${g.id}-${f}`, title: f === 1 ? `${need} ${unit} 🎉` : `${need} ${unit}`, done: value >= need };
  });
  return { value, total: g.target, fraction: Math.min(value / Math.max(g.target, 1), 1), stops };
};
