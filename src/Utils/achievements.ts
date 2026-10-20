import { Application } from '../Interfaces';
import { Preferences } from '../Hooks/PreferencesContext';
import { appliedThisWeek, currentStreak } from './insights';

export interface AchievementContext {
  apps: Application[];
  preferences: Preferences;
  preparedAnswers: number;
  practiceSessions: number;
  bestPractice: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** Current progress toward `goal`. */
  progress: (ctx: AchievementContext) => number;
  goal: number;
}

const reachedInterview = (app: Application) =>
  (app.history || []).some(h => h.status !== 'Başvuruldu') || app.status !== 'Başvuruldu';

const countOffers = (apps: Application[]) =>
  apps.filter(app => app.status === 'Kabul Edildi' || app.interviewStage === 'Teklif Aşaması 📜').length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-seed', emoji: '🌰', title: 'İlk Tohum', description: 'İlk başvurunu ekle.', goal: 1, progress: c => c.apps.length },
  { id: 'five-apps', emoji: '🌱', title: 'Filizlenme', description: '5 başvuruya ulaş.', goal: 5, progress: c => c.apps.length },
  { id: 'ten-apps', emoji: '🌿', title: 'Bahçıvan', description: '10 başvuruya ulaş.', goal: 10, progress: c => c.apps.length },
  { id: 'twentyfive-apps', emoji: '🌳', title: 'Orman Kurucusu', description: '25 başvuruya ulaş.', goal: 25, progress: c => c.apps.length },
  { id: 'first-interview', emoji: '🗣️', title: 'Kapı Aralandı', description: 'İlk mülakat davetini al.', goal: 1, progress: c => c.apps.filter(reachedInterview).length },
  { id: 'three-interviews', emoji: '🎤', title: 'Sahne Senin', description: '3 farklı şirketle mülakata kal.', goal: 3, progress: c => c.apps.filter(reachedInterview).length },
  { id: 'offer', emoji: '📜', title: 'Teklif Masası', description: 'Teklif aşamasına ulaş.', goal: 1, progress: c => countOffers(c.apps) },
  { id: 'accepted', emoji: '🏆', title: 'Hayalindeki İş', description: 'Bir başvurun kabul edilsin.', goal: 1, progress: c => c.apps.filter(a => a.status === 'Kabul Edildi').length },
  { id: 'resilience', emoji: '🍂', title: 'Dayanıklı Ruh', description: 'Bir ret al ve yola devam et. Her "hayır" bir ders!', goal: 1, progress: c => c.apps.filter(a => a.status === 'Reddedildi').length },
  { id: 'weekly-goal', emoji: '🎯', title: 'Hedef Avcısı', description: 'Haftalık başvuru hedefini tamamla.', goal: 1, progress: c => (appliedThisWeek(c.apps).length >= c.preferences.weeklyGoal ? 1 : 0) },
  { id: 'streak-3', emoji: '🔥', title: 'Isınma Turu', description: '3 gün üst üste kariyerin için bir şey yap.', goal: 3, progress: c => currentStreak(c.apps) },
  { id: 'streak-7', emoji: '☄️', title: 'Durdurulamaz', description: '7 günlük seri yakala.', goal: 7, progress: c => currentStreak(c.apps) },
  { id: 'planner', emoji: '📅', title: 'Planlı Yolcu', description: 'Bir mülakatı takvime ekle.', goal: 1, progress: c => c.apps.filter(a => a.interviewDate).length },
  { id: 'organized', emoji: '✅', title: 'Liste Ustası', description: '5 görevi tamamla.', goal: 5, progress: c => c.apps.flatMap(a => a.todos || []).filter(t => t.completed).length },
  { id: 'prepared', emoji: '🧠', title: 'Hazırlıklı Zihin', description: '5 mülakat sorusunu cevapla.', goal: 5, progress: c => c.preparedAnswers },
  { id: 'explorer', emoji: '🧭', title: 'Kaşif', description: '3 farklı şehirde/uzaktan başvuru yap.', goal: 3, progress: c => new Set(c.apps.map(a => a.city.trim().toLocaleLowerCase('tr-TR'))).size },
  { id: 'critic', emoji: '⭐', title: 'Gurme Eleştirmen', description: '5 şirkete puan ver.', goal: 5, progress: c => c.apps.filter(a => a.companyRating).length },
  { id: 'rehearsal', emoji: '🎙️', title: 'Sahne Provası', description: 'Simülatörde 3 prova kaydet.', goal: 3, progress: c => c.practiceSessions },
  { id: 'eloquent', emoji: '🗣️', title: 'Hitabet Ustası', description: 'Simülatörde 85+ puan al.', goal: 1, progress: c => (c.bestPractice >= 85 ? 1 : 0) },

];

export const LEVELS = [
  { name: 'Tohum', emoji: '🌰', xp: 0 },
  { name: 'Filiz', emoji: '🌱', xp: 60 },
  { name: 'Fidan', emoji: '🌿', xp: 160 },
  { name: 'Genç Ağaç', emoji: '🌳', xp: 320 },
  { name: 'Ulu Ağaç', emoji: '🌲', xp: 550 },
  { name: 'Çiçekli Ağaç', emoji: '🌸', xp: 850 },
  { name: 'Meyveli Ağaç', emoji: '🍎', xp: 1250 },
];

const readNumber = (key: string, pick: (raw: unknown) => number) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? pick(JSON.parse(raw)) : 0;
  } catch {
    return 0;
  }
};

export const readPreparedAnswers = () =>
  readNumber('careerflow_preparation', raw =>
    Array.isArray(raw) ? raw.filter((q: { answer?: string }) => q.answer?.trim()).length : 0);

export const FOCUS_KEY = 'careerflow_focus_sessions';
export const readFocusSessions = () => readNumber(FOCUS_KEY, raw => (typeof raw === 'number' ? raw : 0));

export function evaluateGarden(ctx: AchievementContext) {
  const results = ACHIEVEMENTS.map(a => {
    const value = a.progress(ctx);
    return { ...a, value: Math.min(value, a.goal), unlocked: value >= a.goal };
  });
  const unlocked = results.filter(r => r.unlocked);

  const completedTodos = ctx.apps.flatMap(a => a.todos || []).filter(t => t.completed).length;
  const xp =
    ctx.apps.length * 10 +
    ctx.apps.filter(reachedInterview).length * 25 +
    countOffers(ctx.apps) * 50 +
    ctx.apps.filter(a => a.status === 'Kabul Edildi').length * 100 +
    completedTodos * 5 +
    ctx.preparedAnswers * 5 +
    ctx.practiceSessions * 10 +
    unlocked.length * 30;

  let level = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.xp) level = i; });
  const next = LEVELS[level + 1];
  const levelProgress = next ? (xp - LEVELS[level].xp) / (next.xp - LEVELS[level].xp) : 1;

  return { results, unlocked, xp, level, next, levelProgress };
}
