import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { usePersonal } from './usePersonal';
import { usePreferences } from './PreferencesContext';
import { Habit } from '../Utils/personal';
import { fireConfetti } from '../Utils/confetti';

export const useHabitActions = () => {
  const { setHabits } = usePersonal();
  const { preferences } = usePreferences();
  const today = format(new Date(), 'yyyy-MM-dd');
  const bump = (habit: Habit, delta: number) => {
    const before = habit.log[today] ?? 0;
    const value = Math.max(0, before + delta);
    setHabits(prev => prev.map(h => (h.id === habit.id ? { ...h, log: { ...h.log, [today]: value } } : h)));
    if (before < habit.target && value >= habit.target) {
      if (preferences.celebrate) fireConfetti(70);
      toast.success(`${habit.emoji} ${habit.name}: bugünkü hedef tamam!`);
    }
  };
  return { bump, today };
};
