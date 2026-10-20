import { format, parseISO } from 'date-fns';
import { StudyLog } from './study';

/** Five focused hours grow one tree. */
export const MINUTES_PER_TREE = 300;
/** A daily watering helps the sapling a little. */
export const WATER_BONUS = 10;

export const FOREST_KEY = 'careerflow_forest';
export const FOREST_WATER_KEY = 'careerflow_forest_water';

export type TreeKind = 'oak' | 'pine' | 'cherry' | 'birch' | 'maple';

export const TREE_KINDS: { id: TreeKind; name: string; emoji: string }[] = [
  { id: 'oak', name: 'Meşe', emoji: '🌳' },
  { id: 'pine', name: 'Çam', emoji: '🌲' },
  { id: 'cherry', name: 'Kiraz', emoji: '🌸' },
  { id: 'birch', name: 'Huş', emoji: '🤍' },
  { id: 'maple', name: 'Akçaağaç', emoji: '🍁' },
];

export interface ForestState {
  nextKind: TreeKind;
  /** Kind of each grown tree, in order. */
  kinds: TreeKind[];
}

export const DEFAULT_FOREST: ForestState = { nextKind: 'oak', kinds: [] };

export interface ForestProgress {
  growth: number;
  trees: { index: number; date: string }[];
  current: number; // minutes into the sapling
  fraction: number;
}

/** Replays focus sessions and waterings in order to know when each tree finished growing. */
export function forestProgress(log: StudyLog[], waterDays: string[]): ForestProgress {
  const events = [
    ...log.map(l => ({ date: l.date, minutes: l.minutes })),
    ...waterDays.map(d => ({ date: `${d}T12:00:00.000Z`, minutes: WATER_BONUS })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let growth = 0;
  const trees: ForestProgress['trees'] = [];
  for (const e of events) {
    const before = Math.floor(growth / MINUTES_PER_TREE);
    growth += e.minutes;
    const after = Math.floor(growth / MINUTES_PER_TREE);
    for (let i = before; i < after; i++) trees.push({ index: i, date: format(parseISO(e.date), 'yyyy-MM-dd') });
  }
  const current = growth % MINUTES_PER_TREE;
  return { growth, trees, current, fraction: current / MINUTES_PER_TREE };
}

export const saplingStage = (fraction: number) =>
  fraction < 0.15 ? { name: 'Tohum', emoji: '🌰' }
    : fraction < 0.4 ? { name: 'Filiz', emoji: '🌱' }
      : fraction < 0.7 ? { name: 'Fidan', emoji: '🌿' }
        : { name: 'Genç ağaç', emoji: '🌳' };
