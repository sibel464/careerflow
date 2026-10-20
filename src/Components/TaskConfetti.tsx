import { useEffect } from 'react';
import { DATA_EVENT, readStored } from '../Hooks/useLocalStorage';
import { usePreferences } from '../Hooks/PreferencesContext';
import { STUDY_KEYS, StudyTask } from '../Utils/study';
import { fireConfetti } from '../Utils/confetti';

/** 🎉 A confetti burst whenever a task gets ticked off — from any page (Tasks, Calendar, Today…). */
export const TaskConfetti: React.FC = () => {
  const { preferences } = usePreferences();

  useEffect(() => {
    if (!preferences.celebrate) return;
    let done = readStored<StudyTask[]>(STUDY_KEYS.tasks, []).filter(t => t.done).length;
    const onData = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== STUDY_KEYS.tasks) return;
      const now = readStored<StudyTask[]>(STUDY_KEYS.tasks, []).filter(t => t.done).length;
      if (now > done) fireConfetti(110);
      done = now;
    };
    window.addEventListener(DATA_EVENT, onData);
    return () => window.removeEventListener(DATA_EVENT, onData);
  }, [preferences.celebrate]);

  return null;
};
