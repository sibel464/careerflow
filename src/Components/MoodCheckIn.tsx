import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { MOOD_KEY, MOODS, MoodEntry, moodFor, todayKey } from '../Utils/mood';
import { cn } from '../Utils/classNames';

/** One-tap daily mood check-in for the dashboard. */
export const MoodCheckIn: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>(MOOD_KEY, []);
  const today = entries.find(e => e.date === todayKey());

  const choose = (mood: number) => {
    setEntries(prev => {
      const rest = prev.filter(e => e.date !== todayKey());
      const existing = prev.find(e => e.date === todayKey());
      return [{ date: todayKey(), mood, energy: existing?.energy ?? 3, note: existing?.note ?? '', gratitude: existing?.gratitude ?? '' }, ...rest];
    });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink font-serif">Bugün nasılsın? 💭</h3>
        <Link to="/study/motivation/mood" className="text-xs font-bold text-moss hover:underline">Günlük</Link>
      </div>
      <div className="flex justify-between gap-1">
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => choose(m.value)}
            title={m.label}
            aria-label={m.label}
            aria-pressed={today?.mood === m.value}
            className={cn(
              'flex-1 aspect-square rounded-2xl text-2xl sm:text-3xl transition-all border',
              today?.mood === m.value ? 'bg-glass/80 border-moss/50 scale-110 shadow-md' : 'border-transparent hover:bg-glass/50 hover:scale-110',
              today && today.mood !== m.value && 'opacity-40 grayscale'
            )}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      {today && (
        <p className="text-sm font-semibold text-ink-soft mt-4 p-3 rounded-xl bg-glass/50 border border-glass/70 animate-fade-in">
          {moodFor(today.mood).message}
        </p>
      )}
    </div>
  );
};
