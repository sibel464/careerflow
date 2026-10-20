import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGarden } from '../Hooks/useGarden';
import { usePreferences } from '../Hooks/PreferencesContext';
import { LEVELS } from '../Utils/achievements';
import { fireConfetti } from '../Utils/confetti';

const SEEN_KEY = 'careerflow_seen_achievements';
const LEVEL_KEY = 'careerflow_seen_level';

const AchievementToast: React.FC<{ emoji: string; title: string; subtitle: string }> = ({ emoji, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <span className="text-3xl animate-bounce">{emoji}</span>
    <div>
      <p className="text-xs font-black uppercase tracking-wider opacity-70">{subtitle}</p>
      <p className="font-black">{title}</p>
    </div>
  </div>
);

/** Celebrates newly unlocked badges and level-ups, wherever they happen in the app. */
export const AchievementWatcher: React.FC = () => {
  const { unlocked, level } = useGarden();
  const { preferences } = usePreferences();

  const unlockedKey = unlocked.map(a => a.id).join(',');

  useEffect(() => {
    let seen: string[] | null = null;
    let seenLevel: number | null = null;
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      seen = raw ? JSON.parse(raw) : null;
      const rawLevel = localStorage.getItem(LEVEL_KEY);
      seenLevel = rawLevel ? Number(rawLevel) : null;
    } catch { /* ignore */ }

    const ids = unlockedKey ? unlockedKey.split(',') : [];
    // First run ever: remember silently instead of flooding the screen with toasts.
    if (seen !== null) {
      const fresh = unlocked.filter(a => !seen!.includes(a.id));
      fresh.forEach((a, i) => {
        window.setTimeout(() => {
          toast(<AchievementToast emoji={a.emoji} title={a.title} subtitle="Yeni rozet kazandın!" />, { autoClose: 5000 });
        }, i * 600);
      });
      if (seenLevel !== null && level > seenLevel) {
        toast(<AchievementToast emoji={LEVELS[level].emoji} title={`${LEVELS[level].name} oldun!`} subtitle={`Seviye ${level + 1}`} />, { autoClose: 6000 });
      }
      if ((fresh.length > 0 || (seenLevel !== null && level > seenLevel)) && preferences.celebrate) fireConfetti(120);
    }

    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(new Set([...(seen || []), ...ids]))));
      localStorage.setItem(LEVEL_KEY, String(Math.max(level, seenLevel ?? 0)));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedKey, level]);

  return null;
};
