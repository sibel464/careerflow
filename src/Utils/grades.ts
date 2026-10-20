import { v4 as uuidv4 } from 'uuid';

export const GRADES_KEY = 'careerflow_grades';

/** One graded piece of a course: "Vize %40", "Final %60", "Ödev %10"… */
export interface GradeItem { id: string; label: string; weight: number; score: number | null }

export interface Course {
  id: string;
  name: string;
  emoji: string;
  credit: number;
  color: string;
  items: GradeItem[];
}

/** The common Turkish university letter scale. */
export const LETTERS = [
  { letter: 'AA', min: 90, point: 4.0 },
  { letter: 'BA', min: 85, point: 3.5 },
  { letter: 'BB', min: 80, point: 3.0 },
  { letter: 'CB', min: 75, point: 2.5 },
  { letter: 'CC', min: 70, point: 2.0 },
  { letter: 'DC', min: 65, point: 1.5 },
  { letter: 'DD', min: 60, point: 1.0 },
  { letter: 'FD', min: 50, point: 0.5 },
  { letter: 'FF', min: 0, point: 0 },
];

export const letterFor = (score: number) => LETTERS.find(l => score >= l.min) ?? LETTERS[LETTERS.length - 1];

const item = (label: string, weight: number, score: number | null = null): GradeItem => ({ id: uuidv4(), label, weight, score });

export const seedCourses = (): Course[] => [
  { id: uuidv4(), name: 'Web Geliştirme', emoji: '🌐', credit: 5, color: '#4f86c0', items: [item('Vize', 40, 78), item('Final', 60)] },
  { id: uuidv4(), name: 'React & TypeScript', emoji: '⚛️', credit: 4, color: '#b8502c', items: [item('Vize', 30, 64), item('Proje', 20, 90), item('Final', 50)] },
  { id: uuidv4(), name: 'Veritabanları', emoji: '🗄️', credit: 3, color: '#3a9a6e', items: [item('Quiz', 20, 95), item('Vize', 30, 88), item('Final', 50, 91)] },
  { id: uuidv4(), name: 'Algoritmalar', emoji: '🧠', credit: 4, color: '#7a4a8a', items: [item('Vize', 30, 72), item('Proje', 20), item('Final', 50)] },
];

/** Weighted average of what's been graded so far, plus how much weight is still open. */
export const courseStatus = (c: Course) => {
  const total = c.items.reduce((s, i) => s + i.weight, 0) || 1;
  const graded = c.items.filter(i => i.score !== null);
  const gradedWeight = graded.reduce((s, i) => s + i.weight, 0);
  const earned = graded.reduce((s, i) => s + (i.score as number) * i.weight, 0) / total; // points already locked in (0..100 scale)
  const openWeight = total - gradedWeight;
  const complete = openWeight === 0;
  // "So far" average among graded items only — what you'd see on a progress report.
  const soFar = gradedWeight ? graded.reduce((s, i) => s + (i.score as number) * i.weight, 0) / gradedWeight : null;
  return { total, earned, openWeight, complete, soFar, final: complete ? earned : null };
};

/** Score needed on the remaining items (all at the same score) to reach `target`. */
export const neededFor = (c: Course, target: number) => {
  const { total, earned, openWeight } = courseStatus(c);
  if (!openWeight) return null;
  return ((target - earned) * total) / openWeight;
};

/** Credit-weighted GPA over completed courses (or projected with the "so far" average). */
export const gpa = (courses: Course[], projected = false) => {
  let credits = 0;
  let points = 0;
  courses.forEach(c => {
    const st = courseStatus(c);
    const score = st.final ?? (projected ? st.soFar : null);
    if (score === null) return;
    credits += c.credit;
    points += c.credit * letterFor(score).point;
  });
  return credits ? points / credits : null;
};
