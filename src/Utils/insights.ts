import { differenceInCalendarDays, isWithinInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Application } from '../Interfaces';
import { FOLLOW_UP_DAYS } from './constants';

export const isActive = (app: Application) =>
  app.status !== 'Kabul Edildi' && app.status !== 'Reddedildi';

export const daysSince = (iso: string) => differenceInCalendarDays(new Date(), parseISO(iso));

/** Applications sent this calendar week (Monday-based). */
export const appliedThisWeek = (apps: Application[]) => {
  const now = new Date();
  const interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  return apps.filter(app => isWithinInterval(parseISO(app.applicationDate), interval));
};

/** Still "Başvuruldu" with no update for a while — worth a polite follow-up. */
export const needsFollowUp = (apps: Application[]) =>
  apps
    .filter(app => app.status === 'Başvuruldu' && daysSince(app.updatedAt) >= FOLLOW_UP_DAYS)
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

export const pendingTodos = (apps: Application[]) =>
  apps.flatMap(app =>
    (app.todos || [])
      .filter(todo => !todo.completed)
      .map(todo => ({ ...todo, companyName: app.companyName, appId: app.id }))
  );

/** Share of applications that got past the "Başvuruldu" stage. */
export const responseRate = (apps: Application[]) => {
  if (apps.length === 0) return 0;
  const responded = apps.filter(app => app.status !== 'Başvuruldu').length;
  return Math.round((responded / apps.length) * 100);
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'İyi geceler', emoji: '🌙' };
  if (hour < 12) return { text: 'Günaydın', emoji: '☀️' };
  if (hour < 18) return { text: 'Tünaydın', emoji: '🌻' };
  return { text: 'İyi akşamlar', emoji: '🌆' };
};

/** Interviews scheduled from now on, soonest first. */
export const upcomingInterviews = (apps: Application[]) =>
  apps
    .filter(app => app.interviewDate && isActive(app) && parseISO(app.interviewDate).getTime() > Date.now())
    .sort((a, b) => a.interviewDate!.localeCompare(b.interviewDate!));

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Number of career actions (applications sent + status changes) per local day. */
export const activityByDay = (apps: Application[]) => {
  const counts = new Map<string, number>();
  const bump = (iso: string) => {
    const key = dayKey(parseISO(iso));
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (const app of apps) {
    const history = app.history || [];
    if (history.length === 0) bump(app.applicationDate);
    history.forEach(change => bump(change.date));
  }
  return counts;
};

export { dayKey };

/** Consecutive active days ending today (or yesterday, so the streak survives until tonight). */
export const currentStreak = (apps: Application[]) => {
  const activity = activityByDay(apps);
  const cursor = new Date();
  if (!activity.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (activity.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
