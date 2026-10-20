import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const PLANTS_KEY = 'careerflow_plants';

export type PlantKind = 'monstera' | 'cactus' | 'snake' | 'flower' | 'pothos';

export interface Plant {
  id: string;
  name: string;
  kind: PlantKind;
  /** Water every N days. */
  interval: number;
  lastWatered: string; // yyyy-MM-dd
  pot: string;
  history: string[];
}

export const PLANT_KINDS: { id: PlantKind; name: string; interval: number }[] = [
  { id: 'monstera', name: 'Deve tabanı', interval: 7 },
  { id: 'pothos', name: 'Sarmaşık', interval: 5 },
  { id: 'snake', name: 'Paşa kılıcı', interval: 14 },
  { id: 'cactus', name: 'Kaktüs', interval: 21 },
  { id: 'flower', name: 'Menekşe', interval: 4 },
];

export const POT_COLORS = ['#c97b5a', '#e8dccb', '#9aae8c', '#d9a441', '#e3b5a4', '#7d9cc0', '#5b5650'];

const day = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd');

export const seedPlants = (): Plant[] => [
  { id: uuidv4(), name: 'Monti', kind: 'monstera', interval: 7, lastWatered: day(3), pot: POT_COLORS[0], history: [day(3), day(10)] },
  { id: uuidv4(), name: 'Dikenli Dost', kind: 'cactus', interval: 21, lastWatered: day(9), pot: POT_COLORS[1], history: [day(9)] },
  { id: uuidv4(), name: 'Menekşe', kind: 'flower', interval: 4, lastWatered: day(5), pot: POT_COLORS[4], history: [day(5), day(9)] },
  { id: uuidv4(), name: 'Sarmaşık', kind: 'pothos', interval: 5, lastWatered: day(1), pot: POT_COLORS[2], history: [day(1), day(6)] },
];

/** 0 = just watered, 1 = due today, >1 = overdue. */
export const thirstOf = (p: Plant, now = new Date()) => differenceInCalendarDays(now, parseISO(p.lastWatered)) / Math.max(p.interval, 1);

export const statusOf = (p: Plant) => {
  const days = p.interval - differenceInCalendarDays(new Date(), parseISO(p.lastWatered));
  if (days > 1) return { text: `${days} gün sonra sula`, mood: 'happy' as const };
  if (days === 1) return { text: 'Yarın sula', mood: 'ok' as const };
  if (days === 0) return { text: 'Bugün sulama günü 💧', mood: 'due' as const };
  return { text: `${-days} gündür susuz 🥺`, mood: 'thirsty' as const };
};
